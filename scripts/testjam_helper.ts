import { buildOptions, buildSupportCodeLibrary as buildSupportCodeLibraryFn } from './runtime_helpers'
import { generateEvents } from './gherkin_helpers'
import Runtime, { IRuntimeOptions } from '../src/runtime'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../src/formatter/helpers'
import FormatterBuilder from '../src/formatter/builder'
import { IdGenerator } from '@cucumber/messages'
import * as messages from '@cucumber/messages'
import { ISupportCodeLibrary } from '../src/support_code_library_builder/types'
import { ITestCaseAttempt } from '../src/formatter/helpers/event_data_collector'
import { doesNotHaveValue } from '../src/value_checker'
import { IParsedArgvFormatOptions } from '../src/cli/argv_parser'
import { PassThrough } from 'stream'
import { emitSupportCodeMessages } from '../src/cli/helpers'
import util from 'util'

const { uuid } = IdGenerator

export interface ITestSource {
    data: string
    uri: string
}
  
export interface ITestRunOptions {
    runtimeOptions?: Partial<IRuntimeOptions>
    supportCodeLibrary?: ISupportCodeLibrary
    sources?: ITestSource[]
    pickleFilter?: (pickle: messages.Pickle) => boolean
    logFn: (msg: string) => void
}
  
export interface ITestFormatterOptions extends ITestRunOptions {
    parsedArgvOptions?: IParsedArgvFormatOptions
    type: string
}
  
export interface IEnvelopesAndEventDataCollector {
    envelopes: messages.Envelope[]
    eventDataCollector: EventDataCollector
}
  
export async function executeTests({
  parsedArgvOptions = {},
  runtimeOptions = {},
  supportCodeLibrary,
  sources = [],
  type,
  logFn,
}: ITestFormatterOptions) {
  if (doesNotHaveValue(supportCodeLibrary)) {
    supportCodeLibrary = buildSupportCodeLibraryFn()
  }
  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)
  emitSupportCodeMessages({
    supportCodeLibrary,
    eventBroadcaster,
    newId: uuid(),
  })
  const passThrough = new PassThrough()
  FormatterBuilder.build(type, {
    cwd: '',
    eventBroadcaster,
    eventDataCollector,
    log: logFn,
    parsedArgvOptions,
    stream: passThrough,
    cleanup: util.promisify(passThrough.end.bind(passThrough)),
    supportCodeLibrary,
  })
  let pickleIds: string[] = []
  for (const source of sources) {
    const { pickles } = await generateEvents({
      data: source.data,
      eventBroadcaster,
      uri: source.uri,
    })
    pickleIds = pickleIds.concat(pickles.map((p) => p.id))
  }
  const runtime = new Runtime({
    eventBroadcaster,
    eventDataCollector,
    newId: uuid(),
    options: buildOptions(runtimeOptions),
    pickleIds,
    supportCodeLibrary,
  })

  await runtime.start()
}

export const buildSupportCodeLibrary = buildSupportCodeLibraryFn
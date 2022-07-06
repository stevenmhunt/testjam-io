import { buildOptions, buildSupportCodeLibrary as buildSupportCodeLibraryFn } from './runtime_helpers'
import { IParsedSource, parse } from './gherkin_helpers'
import { IGherkinOptions } from '@cucumber/gherkin'
import Runtime, { IRuntimeOptions } from '../src/runtime'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../src/formatter/helpers'
import FormatterBuilder from '../src/formatter/builder'
import { IdGenerator } from '@cucumber/messages'
import * as messages from '@cucumber/messages'
import { ISupportCodeLibrary } from '../src/support_code_library_builder/types'
import { doesNotHaveValue } from '../src/value_checker'
import { PassThrough } from 'stream'
import { emitSupportCodeMessages } from '../src/cli/helpers'
import util from 'util'

const { uuid } = IdGenerator

export interface IParsedArgvFormatRerunOptions {
  separator?: string
}

export enum SnippetInterface {
  AsyncAwait = 'async-await',
  Callback = 'callback',
  Generator = 'generator',
  Promise = 'promise',
  Synchronous = 'synchronous',
}

export interface IParsedArgvFormatOptions {
  colorsEnabled?: boolean
  rerun?: IParsedArgvFormatRerunOptions
  snippetInterface?: SnippetInterface
  snippetSyntax?: string
  [customKey: string]: any
}

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
    language: string
}
  
export interface IEnvelopesAndEventDataCollector {
    envelopes: messages.Envelope[]
    eventDataCollector: EventDataCollector
}

export interface IGenerateEventsRequest {
  data: string
  eventBroadcaster: EventEmitter
  uri: string
  options: IGherkinOptions
}

export async function generateEvents({
  data,
  eventBroadcaster,
  uri,
  options,
}: IGenerateEventsRequest): Promise<IParsedSource> {
  const { envelopes, source, gherkinDocument, pickles } = await parse({
    data,
    uri,
    options,
  })
  envelopes.forEach((envelope) => eventBroadcaster.emit('envelope', envelope))
  return { source, gherkinDocument, pickles }
}

export async function executeTests({
  parsedArgvOptions = {},
  runtimeOptions = {},
  supportCodeLibrary,
  sources = [],
  type,
  language,
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
    env: {},
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
      options: {
        defaultDialect: language
      }
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
/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-ext')
const sinkTest = require('rdf-sink/test')
const Readable = require('readable-stream')
const split2 = require('split2')
const RDFJSJSONSerializer = require('..')

describe('rdf-serializer-rdfjs-jsonld', () => {
  sinkTest(RDFJSJSONSerializer, { readable: true })

  it('should serialize RDFJS spec interface quads to rdfjs+json', () => {
    const quad1 = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object1')
    )
    const quad2 = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.namedNode('http://example.org/object'),
      rdf.namedNode('http://example.org/graph')
    )
    const expected = [{
      'subject': {
        'value': 'http://example.org/subject', 'termType': 'NamedNode'
      },
      'predicate': {
        'value': 'http://example.org/predicate', 'termType': 'NamedNode'
      },
      'object': {
        'value': 'object1',
        'termType': 'Literal',
        'language': '',
        'datatype': {
          'value': 'http://www.w3.org/2001/XMLSchema#string',
          'termType': 'NamedNode'
        }
      },
      'graph': {
        'value': '', 'termType': 'DefaultGraph'
      }
    }, {
      'subject': {
        'value': 'http://example.org/subject', 'termType': 'NamedNode'
      },
      'predicate': {
        'value': 'http://example.org/predicate', 'termType': 'NamedNode'
      },
      'object': {
        'value': 'http://example.org/object', 'termType': 'NamedNode'
      },
      'graph': {
        'value': 'http://example.org/graph', 'termType': 'NamedNode'
      }
    }]
    const input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad1)
      input.push(quad2)
      input.push(null)
    }

    const serializer = new RDFJSJSONSerializer()
    const stream = serializer.import(input)

    let actual = []
    stream.pipe(split2()).on('data', (data) => {
      actual.push(JSON.parse(data))
    })

    return rdf.waitFor(stream).then(() => {
      assert.deepEqual(actual, expected)
    })
  })
})

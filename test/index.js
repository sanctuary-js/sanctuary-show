import assert from 'node:assert';

import test from 'oletus';

import show from 'sanctuary-show';


//    eq :: a -> b -> Undefined !
function eq(actual) {
  assert.strictEqual (arguments.length, eq.length);
  return function eq$1(expected) {
    assert.strictEqual (arguments.length, eq$1.length);
    assert.strictEqual (actual, expected);
  };
}


test ('metadata', () => {
  eq (show.length) (1);
  eq (show.name) ('show');
});

test ('null', () => {
  eq (show (null)) ('null');
});

test ('undefined', () => {
  eq (show (undefined)) ('undefined');
});

test ('Booleans', () => {
  eq (show (false)) ('false');
  eq (show (true)) ('true');
  eq (show (new Boolean (false))) ('new Boolean (false)');
  eq (show (new Boolean (true))) ('new Boolean (true)');
});

test ('numbers', () => {
  eq (show (0)) ('0');
  eq (show (-0)) ('-0');
  eq (show (NaN)) ('NaN');
  eq (show (3.14)) ('3.14');
  eq (show (Infinity)) ('Infinity');
  eq (show (-Infinity)) ('-Infinity');
  eq (show (new Number (0))) ('new Number (0)');
  eq (show (new Number (-0))) ('new Number (-0)');
  eq (show (new Number (NaN))) ('new Number (NaN)');
  eq (show (new Number (3.14))) ('new Number (3.14)');
  eq (show (new Number (Infinity))) ('new Number (Infinity)');
  eq (show (new Number (-Infinity))) ('new Number (-Infinity)');
});

test ('strings', () => {
  eq (show ('')) ('""');
  eq (show ('abc')) ('"abc"');
  eq (show ('foo "bar" baz')) ('"foo \\"bar\\" baz"');
  eq (show (new String (''))) ('new String ("")');
  eq (show (new String ('abc'))) ('new String ("abc")');
  eq (show (new String ('foo "bar" baz'))) ('new String ("foo \\"bar\\" baz")');
});

test ('dates', () => {
  eq (show (new Date (0))) ('new Date ("1970-01-01T00:00:00.000Z")');
  eq (show (new Date (42))) ('new Date ("1970-01-01T00:00:00.042Z")');
  eq (show (new Date (NaN))) ('new Date (NaN)');
  eq (show (new Date ('2001-02-03T04:05:06+0700'))) ('new Date ("2001-02-02T21:05:06.000Z")');
});

test ('errors', () => {
  eq (show (new Error ('a'))) ('new Error ("a")');
  eq (show (new TypeError ('b'))) ('new TypeError ("b")');
});

test ('arguments', () => {
  /* eslint-disable prefer-rest-params */
  eq (show (function() { return arguments; } ())) ('function () { return arguments; } ()');
  eq (show (function() { return arguments; } ('foo'))) ('function () { return arguments; } ("foo")');
  eq (show (function() { return arguments; } ('foo', 'bar'))) ('function () { return arguments; } ("foo", "bar")');
  /* eslint-enable prefer-rest-params */
});

test ('arrays', () => {
  eq (show ([])) ('[]');
  eq (show (['foo'])) ('["foo"]');
  eq (show (['foo', 'bar'])) ('["foo", "bar"]');
  eq (show (/x/.exec ('xyz'))) ('["x", "groups": undefined, "index": 0, "input": "xyz"]');
  eq (show ((() => { const xs = []; xs.z = true; xs.a = true; return xs; }) ())) ('["a": true, "z": true]');
});

test ('objects', () => {
  eq (show ({})) ('{}');
  eq (show ({x: 1})) ('{"x": 1}');
  eq (show ({x: 1, y: 2})) ('{"x": 1, "y": 2}');
  eq (show ({y: 1, x: 2})) ('{"x": 2, "y": 1}');
  eq (show (Object.create (null))) ('{}');
});

test ('sets', () => {
  eq (show (new Set ([])))
     (/***/'new Set ([])');
  eq (show (new Set (['foo'])))
     (/***/'new Set (["foo"])');
  eq (show (new Set (['foo', 'bar'])))
     (/***/'new Set (["foo", "bar"])');
  eq (show (new Set (['foo', 'bar', 'baz'])))
     (/***/'new Set (["foo", "bar", "baz"])');
  eq (show (new Set ([new Set ([])])))
     (/***/'new Set ([new Set ([])])');
  eq (show (new Set ([new Set ([new Set ([])])])))
     (/***/'new Set ([new Set ([new Set ([])])])');
});

test ('maps', () => {
  eq (show (new Map ([])))
     (/***/'new Map ([])');
  eq (show (new Map ([['foo', 'foo']])))
     (/***/'new Map ([["foo", "foo"]])');
  eq (show (new Map ([['foo', 'foo'], ['bar', 'bar']])))
     (/***/'new Map ([["foo", "foo"], ["bar", "bar"]])');
  eq (show (new Map ([['foo', 'foo'], ['bar', 'bar'], ['baz', 'baz']])))
     (/***/'new Map ([["foo", "foo"], ["bar", "bar"], ["baz", "baz"]])');
  eq (show (new Map ([[new Map ([]), new Map ([])]])))
     (/***/'new Map ([[new Map ([]), new Map ([])]])');
  eq (show (new Map ([[new Map ([['kk', 'kv']]), new Map ([['vk', 'vv']])]])))
     (/***/'new Map ([[new Map ([["kk", "kv"]]), new Map ([["vk", "vv"]])]])');
});

test ('other values', () => {
  eq (show (/def/g)) ('/def/g');
  eq (show (Math.sqrt)) ('<object Function>');
  eq (show (Object.defineProperty ({}, Symbol.toStringTag, {value: 'HTMLInputElement'})))
     ('<object HTMLInputElement>');
});

test ('circular structures', () => {
  const ones = [1]; ones.push (ones);
  eq (show (ones)) ('[1, <Circular>]');

  const ones_ = [1]; ones_.push ([1, ones_]);
  eq (show (ones_)) ('[1, [1, <Circular>]]');

  const node1 = {id: 1, rels: []};
  const node2 = {id: 2, rels: []};
  node1.rels.push ({type: 'child', value: node2});
  node2.rels.push ({type: 'parent', value: node1});
  eq (show (node1)) ('{"id": 1, "rels": [{"type": "child", "value": {"id": 2, "rels": [{"type": "parent", "value": <Circular>}]}}]}');
  eq (show (node2)) ('{"id": 2, "rels": [{"type": "parent", "value": {"id": 1, "rels": [{"type": "child", "value": <Circular>}]}}]}');
});

test ('custom @@show method (own property)', () => {
  const Identity = x => ({
    '@@show': () => `Identity (${show (x)})`,
    'value': x,
  });
  eq (show (Identity (['foo', 'bar', 'baz']))) ('Identity (["foo", "bar", "baz"])');
  eq (show (Identity ([Identity (1), Identity (2), Identity (3)]))) ('Identity ([Identity (1), Identity (2), Identity (3)])');
});

test ('custom @@show method (prototype)', () => {
  function Identity(x) {
    if (!(this instanceof Identity)) return new Identity (x);
    this.value = x;
  }
  Identity.prototype['@@show'] = function() {
    return `Identity (${show (this.value)})`;
  };
  eq (show (Identity (['foo', 'bar', 'baz']))) ('Identity (["foo", "bar", "baz"])');
  eq (show (Identity ([Identity (1), Identity (2), Identity (3)]))) ('Identity ([Identity (1), Identity (2), Identity (3)])');
  eq (show (Identity.prototype)) ('{"@@show": <object Function>}');
});

//. # sanctuary-show
//.
//. Haskell has a `show` function which can be applied to a compatible value to
//. produce a descriptive string representation of that value. The idea is that
//. the string representation should, if possible, be an expression which would
//. produce the original value if evaluated.
//.
//. This library provides a similar [`show`](#show) function.
//.
//. In general, this property should hold: `eval (show (x)) = x`. In some cases
//. parens are necessary to ensure correct interpretation (`{}`, for example,
//. is an empty block rather than an empty object in some contexts). Thus the
//. property is more accurately stated `eval ('(' + show (x) + ')') = x`.
//.
//. One can make values of a custom type compatible with [`show`](#show) by
//. defining a `@@show` method. For example:
//.
//. ```javascript
//. //# Maybe#@@show :: Maybe a ~> () -> String
//. //.
//. //. ```javascript
//. //. > show (Nothing)
//. //. 'Nothing'
//. //.
//. //. > show (Just (['foo', 'bar', 'baz']))
//. //. 'Just (["foo", "bar", "baz"])'
//. //. ```
//. Maybe.prototype['@@show'] = function() {
//.   return this.isNothing ? 'Nothing' : 'Just (' + show (this.value) + ')';
//. };
//. ```

export {show as default};

//  $$show :: String
const $$show = '@@show';

//  seen :: Array Any
const seen = new WeakSet ();

//  entry :: Object -> String -> String
const entry = o => k => show (k) + ': ' + show (o[k]);

//  sortedKeys :: Object -> Array String
const sortedKeys = o => (Object.keys (o)).sort ();

//# show :: Showable a => a -> String
//.
//. Returns a useful string representation of the given value.
//.
//. Dispatches to the value's `@@show` method if present.
//.
//. Where practical, `show (eval ('(' + show (x) + ')')) = show (x)`.
//.
//. ```javascript
//. > show (null)
//. 'null'
//.
//. > show (undefined)
//. 'undefined'
//.
//. > show (true)
//. 'true'
//.
//. > show (new Boolean (false))
//. 'new Boolean (false)'
//.
//. > show (-0)
//. '-0'
//.
//. > show (NaN)
//. 'NaN'
//.
//. > show (new Number (Infinity))
//. 'new Number (Infinity)'
//.
//. > show ('foo\n"bar"\nbaz\n')
//. '"foo\\n\\"bar\\"\\nbaz\\n"'
//.
//. > show (new String (''))
//. 'new String ("")'
//.
//. > show (['foo', 'bar', 'baz'])
//. '["foo", "bar", "baz"]'
//.
//. > show ([[[[[0]]]]])
//. '[[[[[0]]]]]'
//.
//. > show ({x: [1, 2], y: [3, 4], z: [5, 6]})
//. '{"x": [1, 2], "y": [3, 4], "z": [5, 6]}'
//. ```
const show = x => {
  if (x === null) return 'null';
  if (x === undefined) return 'undefined';
  if (typeof x[$$show] === 'function') return x[$$show] ();
  if (seen.has (x)) return '<Circular>';

  const repr = Object.prototype.toString.call (x);

  switch (repr) {

    case '[object Boolean]':
      return typeof x === 'object' ?
        'new Boolean (' + show (x.valueOf ()) + ')' :
        x.toString ();

    case '[object Number]':
      return typeof x === 'object' ?
        'new Number (' + show (x.valueOf ()) + ')' :
        1 / x === -Infinity ? '-0' : x.toString (10);

    case '[object String]':
      return typeof x === 'object' ?
        'new String (' + show (x.valueOf ()) + ')' :
        JSON.stringify (x);

    case '[object RegExp]':
      return x.toString ();

    case '[object Date]':
      return 'new Date (' +
             show (isNaN (x.valueOf ()) ? NaN : x.toISOString ()) +
             ')';

    case '[object Error]':
      return 'new ' + x.name + ' (' + show (x.message) + ')';

    case '[object Arguments]':
      return 'function () { return arguments; } (' +
             (Array.prototype.map.call (x, show)).join (', ') +
             ')';

    case '[object Array]':
      seen.add (x);
      try {
        return '[' + ((x.map (show)).concat (
          sortedKeys (x)
          .filter (k => !(/^\d+$/.test (k)))
          .map (entry (x))
        )).join (', ') + ']';
      } finally {
        seen.delete (x);
      }

    case '[object Object]':
      seen.add (x);
      try {
        return '{' + ((sortedKeys (x)).map (entry (x))).join (', ') + '}';
      } finally {
        seen.delete (x);
      }

    case '[object Set]':
      seen.add (x);
      try {
        return 'new Set (' + show (Array.from (x.values ())) + ')';
      } finally {
        seen.delete (x);
      }

    case '[object Map]':
      seen.add (x);
      try {
        return 'new Map (' + show (Array.from (x.entries ())) + ')';
      } finally {
        seen.delete (x);
      }

    default:
      return repr.replace (/^\[(.*)\]$/, '<$1>');

  }
};

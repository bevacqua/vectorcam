# vectorcam

> Record gifs out of `<svg>` elements painlessly

# install

```js
npm i vectorcam -S
```

# limitations

- assumes `<svg>` element has `width` and `height` attributes
- uses [gifshot][1], which uses black for transparency [(#40)][2]
- super slow, use wisely
- mega slow, defaults to 4 fps and it still takes a long time to generate short gifs
- css styles applied via classes are lost unless they're listed below
  - `background-color`
  - `color`
  - `dominant-baseline`
  - `fill`
  - `font-family`
  - `font-size`
  - `opacity`
  - `r`
  - `stroke`
  - `stroke-dasharray`
  - `stroke-width`
  - `text-anchor`
- seriously, it's **sooooo slow!**

# glitter

- completely in-browser
- you just provide the `<svg>` element
- you get a base64 image blob back
- rich programmatic api

# usage

Here's an example usage where we select an `<svg>` element, record whatever is rendered on it for two seconds, and then print it out to an image tag as a gif.

```js
var svg = document.querySelector('svg')
var cam = vectorcam(svg)

cam.start()
setTimeout(function () {
  cam.stop(function (err, data) {
    if (err) {
      throw err
    }
    var image = document.createElement('img')
    image.src = data
    document.body.appendChild(image)
  })
}, 2000)
```

# options

You can pass in an options object to `vectorcam(svg, options?)`. Here's the list of options.

- `fps` how many `cam.snap` shots per second to make while `cam.recording`, defaults to `4`

# `cam.start()`

Starts recording. Returns `cam`.

# `cam.pause()`

Pauses recording. Returns `cam`. _Make your own svg-based Vine web-app!_

# `cam.resume()`

Resumes recording. Returns `cam`.

# `cam.reset()`

Stops recording. Removes all frames. Returns `cam`.

# `cam.add(frame)`

Adds a `frame`. It can be whatever [`gifshot`][1] accepts.

# `cam.snap()`

Adds a frame taken from the `<svg>` element.

# `cam.stop(done?)`

Stops recording. Creates a gif through [`gifshot`][1] and eventually invokes `done(err, image)`. The `err` may be missing, the `image` is a base64 encoded image blob. Returns `cam`.

# `cam.frames`

Returns a read-only view into the recorded frames.

# `cam.recording`

Returns a read-only view into whether the camera is _"on"_ _-- recording frames automatically with `cam.snap` at a `fps/second` speed._

# demo

See [bevacqua.github.io/promisees][3] for a live demo. You click on the video camera icon and then it generates a gif using `vectorcam`.

# example gif

[![promisees visualization using vectorcam][4]][3]

# license

MIT

[1]: https://github.com/yahoo/gifshot
[2]: https://github.com/yahoo/gifshot/issues/40
[3]: http://bevacqua.github.io/promisees
[4]: http://i.imgur.com/Ou5Q0Nb.gif

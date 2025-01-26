<script lang="ts">
  import exampleConfig from '../../../exampleConfig.json'

  const exampleUrl = Object.keys(exampleConfig)[0]
</script>

<div>
  <h2>How Config Works</h2>
  <p>Here is an example configuration, which is explained below.</p>
  <pre>{JSON.stringify(exampleConfig, null, 2)}</pre>
  <h3>Explanation</h3>
  <p>
    The top-level key for each entry is a URL where the action sequence is intended to be run. In
    this case, <code>{exampleUrl}</code>.
  </p>
  <p>
    For each URL, an array of action sequences can be configured. When you navigate to the matching
    URLs and open the Click 'em All extension, you will be presented with a list of buttons for each
    of the action sequences you have configured.
  </p>
  <p>
    Each action sequence has a <code>name</code> and consists of an ordered set of
    <code>targets</code>.
  </p>
  <div>
    <p>A target in an action sequence is configured with several options:</p>
    <ul>
      <li><code>name</code> (required): A descriptive name for the target</li>
      <li>
        <code>selector</code> (required): A CSS selector that can be used to find the target using
        methods such as
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector">
          <code>document.querySelector</code>
        </a>
        or
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll">
          <code>document.querySelectorAll</code>
        </a>
      </li>
      <li>
        <code>strategy</code> (required): Which strategy to use to handle the target. Currently the
        following strategies are supported:
        <ul>
          <li>
            <code>clickAllFound</code>: Click all found instances of the target immediately.
          </li>
          <li>
            <code>clickWhilePresent</code>: Keep clicking the target until it's no longer found in
            the document.
          </li>
        </ul>
      </li>
      <li>
        <code>timeBetweenMs</code> (optional): Number of milliseconds to wait in between handling each
        found instance of the target. Default is no wait time in between.
      </li>
      <li>
        <code>maxClicks</code> (optional): Maximum number of times to click a target before moving
        onto the next one in the sequence. Defaults to <code>1000</code>
      </li>
    </ul>
  </div>
  <h2>Why Is This Thing So Ugly?</h2>
  <p>
    Once the name popped in my head, I had to have some fun and pay some homage to a certain album
    that was part of some fond memories from my youth. Modern slick web apps and accessibility be
    damned.
  </p>
</div>

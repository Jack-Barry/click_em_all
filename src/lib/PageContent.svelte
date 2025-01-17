<script lang="ts">
  import logo from '~/assets/logo.svg';

  const imageUrl = new URL(logo, import.meta.url).href;
</script>

<img src={imageUrl} height="45" alt="" />
<h1>
  <slot></slot>
</h1>

<script lang="ts">
  import logo from '~/assets/logo.svg';

  const logoImageUrl = new URL(logo, import.meta.url).href;
</script>

<div class="logo">
  <img src={logoImageUrl} height="50" alt="" />
</div>

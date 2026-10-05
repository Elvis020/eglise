<script lang="ts">
  import AuthPrototypeForm from '$lib/components/AuthPrototypeForm.svelte';

  let { data, form } = $props();
</script>

<AuthPrototypeForm authMode={data.authMode} {form} mode="login" next={data.next} />

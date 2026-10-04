<script lang="ts">
  import IconCircleCheck from '@tabler/icons-svelte-runes/icons/circle-check';
  import IconX from '@tabler/icons-svelte-runes/icons/x';
  import { Toaster } from 'svelte-sonner';
</script>

<Toaster
  closeButton
  closeButtonAriaLabel="Dismiss notification"
  containerAriaLabel="Notifications"
  duration={4000}
  gap={8}
  mobileOffset={16}
  offset={24}
  pauseWhenPageIsHidden
  position="bottom-right"
  theme="light"
  visibleToasts={1}
>
  {#snippet successIcon()}
    <IconCircleCheck aria-hidden="true" size={16} stroke={1.8} />
  {/snippet}
  {#snippet closeIcon()}
    <IconX aria-hidden="true" size={14} stroke={1.8} />
  {/snippet}
</Toaster>

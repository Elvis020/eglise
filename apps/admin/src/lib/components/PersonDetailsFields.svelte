<script lang="ts">
  import { personKindLabels, type PersonDetailsErrors, type PersonKind } from '$lib/domain';
  import EgliseSelect, { type EgliseSelectOption } from './EgliseSelect.svelte';

  export let name = '';
  export let kind: PersonKind = 'person';
  export let phone = '';
  export let neighbourhood = '';
  export let errors: PersonDetailsErrors = {};
  export let onchange: () => void = () => undefined;

  const personKindOptions: EgliseSelectOption[] = Object.entries(personKindLabels).map(
    ([value, label]) => ({ value, label })
  );
</script>

<div class="field">
  <label for="person-kind">Person type</label>
  <EgliseSelect id="person-kind" bind:value={kind} options={personKindOptions} {onchange} />
  <p class="help">This does not assign membership or a neighbourhood.</p>
</div>

<div class="field">
  <label for="name">Full name</label>
  <input
    id="name"
    bind:value={name}
    autocomplete="name"
    aria-invalid={Boolean(errors.name)}
    aria-describedby="name-error"
  />
  <p class="error" id="name-error">{errors.name ?? ''}</p>
</div>

<div class="field">
  <label for="phone">Phone number <span class="field-optional">Optional for visitors</span></label>
  <input
    id="phone"
    bind:value={phone}
    inputmode="tel"
    autocomplete="tel"
    aria-invalid={Boolean(errors.phone)}
    aria-describedby="phone-help phone-error"
  />
  <p class="help" id="phone-help">
    Use a Ghanaian mobile number or international E.164 number. A shared number is valid.
  </p>
  <p class="error" id="phone-error">{errors.phone ?? ''}</p>
</div>

<div class="field">
  <label for="neighbourhood">Neighbourhood <span class="field-optional">Optional</span></label>
  <input
    id="neighbourhood"
    bind:value={neighbourhood}
    aria-invalid={Boolean(errors.neighbourhood)}
    aria-describedby="neighbourhood-error"
  />
  <p class="error" id="neighbourhood-error">{errors.neighbourhood ?? ''}</p>
</div>

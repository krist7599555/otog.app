<script lang="ts">
import type { ActionData, PageData } from './$types';
import { enhance } from '$app/forms';

export let data: PageData;
export let form: ActionData;

$: console.log(data);
</script>

<div class="h-[inherit] bg-slate-200">
  <div class="max-w-[500px] mx-auto px-5 py-12">
    <form method="POST" action="?/update_problem" class="flex flex-col gap-y-4" use:enhance>
      <fieldset>
        <legend>Basic Information</legend>
        <div>
          <label for="id">Id</label>
          <input class="input" type="number" name="id" required bind:value="{data.id}" readonly />
        </div>
        <div>
          <label for="title">Title</label>
          <input class="input" type="text" name="title" bind:value="{data.title}" required />
        </div>
        <div>
          <label for="pdf">PDF</label>
          <input class="input" type="text" name="pdf" bind:value="{data.pdf}" />
          <p class="hint">TODO: upload file and pdf</p>
        </div>
      </fieldset>

      <fieldset>
        <legend>Constrain</legend>
        <div>
          <label for="memorylimit">Memory</label>
          <select class="input" type="text" value="100MB">
            <option value="1GB">1GB</option>
            <option value="500MB">500MB</option>
            <option value="200MB">200MB</option>
            <option value="100MB">100MB</option>
            <option value="50MB">50MB</option>
            <option value="10MB">10MB</option>
            <option value="5MB">5MB</option>
            <option value="2MB">2MB</option>
            <option value="1MB">1MB</option>
            <option value="500KB">500KB</option>
            <option value="100KB">100KB</option>
            <option value="specific">Specific</option>
          </select>
          <p class="hint">TODO: code as config to check problem.<br />not sure how to do</p>
        </div>

        <div>
          <label for="timelimit">timelimit</label>
          <select class="input" type="text" value="1s">
            <option value="5s">5s</option>
            <option value="3s">3s</option>
            <option value="2s">2s</option>
            <option value="1s">1s</option>
            <option value="800ms">800ms</option>
            <option value="500ms">500ms</option>
            <option value="300ms">300ms</option>
            <option value="200ms">200ms</option>
            <option value="100ms">100ms</option>
            <option value="50ms">50ms</option>
            <option value="10ms">10ms</option>
            <option value="specific">Specific</option>
          </select>
          <p class="hint">TODO: may be this section is dynamic</p>
        </div>
      </fieldset>
      <fieldset>
        <legend>Grading</legend>
        <div>
          <label for="grading">Grading</label>
          <select class="input" type="text">
            <option value="basic">Basic Input/Output</option>
            <option value="interactive">Interactive</option>
          </select>
          <p class="hint">TODO: code as config to check problem.<br />not sure how to do</p>
        </div>

        <div>
          <label for="testcases">Test Case</label>
          <div class="grid grid-cols-2 gap-1">
            {#each Array.from({ length: 10 }) as _, i}
              <div
                class="p-2 border-l-4 [&:hover::after]:[content:'_(click_to_download)'] [&:hover::after]:text-xs [&:hover::after]:opacity-70 border-b-[1px] rounded hover:border-primary cursor-pointer "
              >
                {i + 1}.in
              </div>
              <div
                class="p-2 border-l-4 [&:hover::after]:[content:'_(click_to_download)'] [&:hover::after]:text-xs [&:hover::after]:opacity-70 border-b-[1px] rounded hover:border-primary cursor-pointer "
              >
                {i + 1}.sol
              </div>
            {/each}
            <div
              class="col-span-full border p-4 text-center rounded shadow-inner cursor-pointer hover:underline hover:text-primary"
            >
              Drag and Drop to upload
            </div>
          </div>
        </div>
      </fieldset>
      <div class="w-full">
        <button type="submit" class="button">Update</button>
        {#if form}
          <div class="mt-2">
            {#if form.success}
              <span
                class="bg-green-200  border border-green-800 text-green-800 py-1 px-5 text-sm rounded-lg"
              >
                {form.message}
              </span>
            {:else}
              <span
                class="bg-red-200  border border-red-800 text-red-800 py-1 px-5 text-sm rounded-lg"
              >
                {form.error_message}
              </span>
            {/if}
          </div>
        {/if}
      </div>
    </form>
  </div>
</div>

<style lang="postcss">
fieldset {
  @apply px-5 pb-8 pt-2 border rounded-xl bg-white relative;
}
legend {
  @apply text-xl text-primary font-bold bg-white rounded-lg px-5 pt-2 relative -left-5;
}
label {
  @apply block font-bold mt-4;
}
label + .input {
  @apply block w-full my-1;
}
label + .input + .hint {
  @apply block text-xs opacity-70;
}
</style>

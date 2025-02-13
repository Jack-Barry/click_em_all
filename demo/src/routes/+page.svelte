<script lang="ts">
	let itemCount = $state(0);
	let items = $derived(Array.from({ length: itemCount }).map((_, index) => index + 1));

	let itemClickCount = $state(0);
	let addMoreClickCount = $state(0);
</script>

<button
	onclick={() => {
		itemCount = 0;
		itemClickCount = 0;
		addMoreClickCount = 0;
	}}
>
	Reset
</button>

<p>Add more clicked {addMoreClickCount} times</p>
<button
	id="add-more-button"
	onclick={() => {
		itemCount += 10;
		addMoreClickCount++;
	}}
>
	Add more items
</button>

<p>Items clicked {itemClickCount} times</p>
{#each items as item}
	<div>
		<button
			class="item-button"
			onclick={() => {
				itemClickCount++;
			}}
		>
			Item #{item}
		</button>
	</div>
{/each}

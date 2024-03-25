<h1>Click 'em All</h1>
<button
	on:click={async () => {
		await browser.runtime.openOptionsPage();
	}}>Options</button
>

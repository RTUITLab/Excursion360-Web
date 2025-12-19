export class PrefetchResourcesManager {
	private linksContainer: HTMLElement;
	private addedLinks = new Set<string>();
	constructor() {
		this.linksContainer = window.document.querySelector("#prefetchLinks");
	}

	public addResource(link: string) {
		if (this.addedLinks.has(link)) {
			return;
		}
		const preloadLink = window.document.createElement("link");
		preloadLink.rel = "prefetch";
		preloadLink.as = "fetch";
		preloadLink.href = link;
		this.linksContainer.appendChild(preloadLink);
		this.addedLinks.add(link);
	}

	public clear() {
		while (this.linksContainer.firstChild) {
			this.linksContainer.removeChild(this.linksContainer.firstChild);
		}
		this.addedLinks.clear();
	}
}

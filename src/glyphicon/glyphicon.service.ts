import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/toPromise";

// stores data in localStorage (which is strings only)
// returns promises of the data
class LocalPromiseCache {
	// key so we avoid collisions
	static key = "cdl-";
	constructor() {}

	get(item: string): Promise<string> {
		return new Promise((resolve, reject) => {
			resolve(localStorage.getItem(LocalPromiseCache.key + item));
		});
	}

	set(item: string, promise: Promise<string>): void {
		promise.then(data => {
			localStorage.setItem(LocalPromiseCache.key + item, data);
		});
	}

	has(item: string): boolean {
		if (localStorage.getItem(LocalPromiseCache.key + item)) { return true; }
		return false;
	}
}

@Injectable()
export class IconService {
	public static spriteCache: Map<string, Promise<string>> | LocalPromiseCache = new Map();
	public static cacheLevel: "none" | "simple" | "aggressive" = "simple";
	public static baseURL = "http://peretz-icons.mybluemix.net/";

	static setBaseURL(url: string) {
		IconService.baseURL = url;
	}

	static setCacheLevel(level: "none" | "simple" | "aggressive") {
		IconService.cacheLevel = level;
		if (level === "aggressive") {
			console.warn("aggressive caching is experimental!");
			IconService.spriteCache = new LocalPromiseCache();
		}
	}

	constructor(private http: Http) {}

	size2px(size) {
		if (parseFloat(size)) {
			return parseFloat(size) + "px";
		}
		switch (size) {
			case "xs":
				return "14px";
			case "sm":
				return "16px";
			case "md":
				return "20px";
			case "lg":
				return "30px";
			default:
				return "16px";
		}
	}

	getSprite(name) {
		if (IconService.cacheLevel === "none") {
			return this.http.get(`${IconService.baseURL}${name}.svg`)
				.toPromise()
				.then(res => res.text(),
					err => {
						console.error("failed to load sprite", name, "check that the server is available and baseURL is correct");
						return "";
					});
		} else {
			if (IconService.spriteCache.has(name)) {
				return IconService.spriteCache.get(name);
			}
			let spriteReq = this.http.get(`${IconService.baseURL}${name}.svg`)
				.toPromise()
				.then(res => res.text(),
					err => {
						console.error("failed to load sprite", name, "check that the server is available and baseURL is correct");
						return "";
					});
			IconService.spriteCache.set(name, spriteReq);
			return spriteReq;
		}
	}
}

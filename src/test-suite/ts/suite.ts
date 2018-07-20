/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

export class TestSuite {
	private tests: TestSuite.Test[] = [];
	private failures: TestSuite.Failure[];

	constructor (
		public name: string
	) {}

	public test(name: string, handler: TestSuite.Test.handler) {
		this.tests.push({
			name: name,
			handler: handler,
		});
	}


	public async run() {
		this.failures = [];
		console.log(`\x1b[33m Suite:\x1b[0m ${this.name}\x1b[0m`);
		for(const test of this.tests) {
			try {
				await test.handler();
				console.log(` - \x1b[32mPass:\x1b[0m ${test.name}\x1b[0m`);
			} catch(error) {
				console.log(` - \x1b[31mFail:\x1b[0m ${test.name}\x1b[0m`);
				this.failures.push({
					test: test.name,
					error: error
				});
				continue
			}
		}
		console.log('')
		if(this.failures.length > 0) {
			for(const failure of this.failures) {
				console.log(`  \x1b[33mTest \x1b[31m${failure.test}\x1b[33m failed due to:\x1b[0m`);
				console.log(`  ${failure.error.stack}`)
				console.log('')
			}
			//@ts-ignore
			process.exit(1);
		}
	}
}

export module TestSuite {
	export module Test {
		export type name = string;
		export type handler = () => Promise<void>;
	}
	export interface Failure {
		test: TestSuite.Test.name;
		error: Error;
	}
	export interface Test {
		name: TestSuite.Test.name;
		handler: TestSuite.Test.handler;
	}
}

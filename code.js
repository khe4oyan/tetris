class Element {
	type;
	color;
	form = [];

	j;
	i;

	constructor(j, i, color, form) {
		this.j = j;
		this.i = i;
		this.color = color;
		this.type = form;
		this.form = this.create_form(form);
	}

	create_form(form) {
		// form = 'square';

		// change form and set d/l/u/r
		switch(form) { 
			// forms: ['square', 'line', 'g', 'one'],
			case 'one': return [];
			case 'square': { this.i += 1; return ['u', 'r', 'd']; }
			case 'line': { this.i += 2; return ['u', 'u', 'd', 'd', 'd']; }
			case 'g': { return ['r', 'l', 'd', 'd']; }
			case 'g2': { return ['l', 'r', 'd', 'd']; }
			default: console.error(`undefined form: ${form}`);
		}
	}

	show(world) {
		if (!world) { console.error(`world is not defined: ${world}`); }
		// use form and transform this type in '#' symbols 
		// d - down, l - left, u - up, r - right
		let i = this.i;
		let j = this.j;

		const symb = '#';

		world[i][j] = symb;
		
		if (this.form.length == 0) { return; }

		for (let k = 0; k < this.form.length; ++k) {
			const side = this.form[k];

			switch(side) { 
				case 'd': {++i; break; }
				case 'l': { --j; break; }
				case 'u': { --i; break; }
				case 'r': { ++j; break; }
				default: console.error(`error side: ${side}`);
			}

			world[i][j] = symb;
		}
	}

	position_update(i = null, j = null) {
		this.i = i ?? this.i + 1;
		this.j = j ?? this.j;
	}

	rotate() {
		try {
			if (this.type == 'square' || this.type == 'one') { return; }
			
			// d-l, l-u, u-r, r-d
			for (let i = 0; i < this.form.length; ++i) {
				switch(this.form[i]) {
					case 'd': this.form[i] = 'l'; break;
					case 'l': this.form[i] = 'u'; break;
					case 'u': this.form[i] = 'r'; break;
					case 'r': this.form[i] = 'd'; break;
					default: console.error(`undefined form element: ${i} in ${form}`);
				}
			}
			
			this.show();
		} catch (error) {
			console.warn('overflow');
		}
	}

	get_color() {
		return this.color;
	}
}

const tetris = {
	cnv: null,
	ctx: null,
	
	square_size: 50,
	world: [],
	
	forms: ['square', 'line', 'g', 'g2', 'one'],

	colors: ['rgba(183, 42, 42, 0.624)', 'rgba(42, 42, 167, 0.572)', 'rgba(47, 144, 47, 0.485)', 'rgba(133, 104, 49, 0.535)'],

	select_element: null, // use class Element

	init() {
		this.cnv = document.getElementById('display');
		this.ctx = this.cnv.getContext('2d');
		
		const canv_width = document.querySelector('canvas').width;
		const canv_height = document.querySelector('canvas').height;

		const w = canv_width / this.square_size;
		const h = canv_height / this.square_size;

		this.world_create(w, h);
		this.create_element();
		this.select_element.show(this.world);

		this.game_start(canv_width, canv_height);
	},

	create_element() {
		// use class Element
		if (this.select_element != null) {
			console.error(`element has in world: ${this.select_element}`);
		}
		
		const rand_form = Math.floor(Math.random() * this.forms.length);
		const rand_color = Math.floor(Math.random() * this.colors.length);

		this.select_element = new Element(4, 0, this.colors[rand_color], this.forms[rand_form]);
	},

	world_create(w, h) {
		for (let i = 0; i < h; ++i) {
			let line = [];
			
			for (let j = 0; j < w; ++j) {
				line[j] = ' ';
			}

			this.world[i] = line;
		}
	},

	cell_render(canv_width, canv_height, w, h) {
		for (let i = 1; i < w; ++i) {
			this.ctx.fillRect(this.square_size * i, 0, 1, canv_height);
		}
		
		for (let i = 1; i < h; ++i) {
			this.ctx.fillRect(0, this.square_size * i, canv_width, 1);
		}
	},

	game_start(canv_width, canv_height) {
		setInterval(() => {
			this.world_render(canv_width, canv_height);
		}, 1000);
	},
	
	world_render(canv_width, canv_height) {
		this.canvas_clear(canv_width, canv_height);
		// this.cell_render(canv_width, canv_height, canv_width / this.square_size, canv_height / this.square_size);
		this.element_render();
		this.calculate_gameplay();
	},

	calculate_gameplay() {
		console.log('====');
		const world = this.world;

		const element = [];
		const free_space = [];
		const delete_symbols = [];
		
		let gray = false;

		for (let i = world.length - 1; i >= 0; --i) {
			for (let j = world[i].length - 1; j >= 0 ; --j) {
				if (world[i][j] == '#') {
					element.push([i, j]);
					const under_symb = world[i - 1][j];

					if (i == 17 || under_symb == 'f') {
						gray = true;
						continue;
					}
				}
			}
		}
		
		if (gray) { 
			fill_gray(world, element); 
			// delete select element
			// create new element
			return;
		}

		this.drop_down(world, free_space, delete_symbols);
	},
	
	drop_down(world, free_space, delete_symbols) {
		console.log(free_space, delete_symbols);
		for (let i = 0; i < free_space.length; ++i) {
			[l, j] = free_space[i];
			world[l][j] = '#';
		}

		for (let i = 0; i < delete_symbols.length; ++i) {
			[l, j] = delete_symbols[i];
			world[l][j] = ' ';
		}

		this.select_element.position_update();
	},

	fill_gray(world, element) {
		// refill gray color;
		for (let i = 0; i < element.length; ++i) {
			[l, j] = element[i];
			world[l][j] = 'f';
		}
	},

	element_render() {
		for (let i = 0; i < this.world.length; ++i) {
			for (let j = 0; j < this.world[i].length; ++j) {
				const symbol = this.world[i][j];

				switch(symbol) {
					case '#': this.square_render(i, j, this.select_element.get_color()); break;
					case 'f': this.square_render(i, j, 'gray'); break;
					case ' ': continue;
					default: console.error(`undefined symbol in render: ${symbol}`);
				}
			}
		}
	},

	square_render(i, j, color) {
		const tmp_color = this.ctx.fillStyle;

		i *= this.square_size;
		j *= this.square_size;

		this.ctx.fillStyle = color;
		this.ctx.fillRect(j, i, this.square_size, this.square_size);
		this.ctx.fillStyle = tmp_color;
	},

	canvas_clear(canv_width, canv_height) {
		const tmp_color = this.ctx.fillStyle;

		this.ctx.fillStyle = 'lavender';
		this.ctx.fillRect(0, 0, canv_width, canv_height);
		
		this.ctx.fillStyle = tmp_color;
	},
};

tetris.init();

function print_world_in_console() { // for DEBUGGING
	console.log('======');
	for (let i = 0; i < tetris.world.length; ++i) {
		console.log(tetris.world[i]);
	}
}
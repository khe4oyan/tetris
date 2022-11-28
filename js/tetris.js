class Tetris {
	game_status = null;

	cnv = null;
	ctx = null;
	
	square_size = 50;
	world = [];
	
	forms = ['square', 'line', 'g', 'g2', 'one', 'z', 'z2'];

	colors = ['rgba(183, 42, 42, 0.624)', 'rgba(42, 42, 167, 0.572)', 'rgba(47, 144, 47, 0.485)', 'rgba(133, 104, 49, 0.535)'];

	select_element = null // use class Elemen;

	side = null;

	constructor() {
		this.init();
	}

	init() {
		this.cnv = document.getElementById('display');
		this.ctx = this.cnv.getContext('2d');
		
		const canv_width = document.querySelector('canvas').width;
		const canv_height = document.querySelector('canvas').height;

		const w = canv_width / this.square_size;
		const h = canv_height / this.square_size;


		this.game_status = true;

		this.world_create(w, h);
		this.select_element = null;
		this.create_element();
		this.select_element.show(this.world);

		this.add_keys();

		this.game_start(canv_width, canv_height);
	}
	
	add_keys() {
		addEventListener('keydown', (button) => {
			if (this.side != null) { return; }
			
			const key = button.key;

			switch(key) {
				case 'a': this.side = 'left'; break;
				case 'd': this.side = 'right'; break;
			}
		})
	}

	create_element() {
		// use class Element
		if (this.select_element != null) {
			console.error(`element has in world = ${this.select_element}`);
		}
		
		const rand_form = Math.floor(Math.random() * this.forms.length);
		const rand_color = Math.floor(Math.random() * this.colors.length);

		this.select_element = new Element(4, 0, this.colors[rand_color], this.forms[rand_form]);
	}

	world_create(w, h) {
		this.world = [];

		for (let i = 0; i < h; ++i) {
			let line = [];
			
			for (let j = 0; j < w; ++j) {
				line[j] = ' ';
			}

			this.world[i] = line;
		}
	}

	cell_render(canv_width, canv_height, w, h) {
		for (let i = 1; i < w; ++i) {
			this.ctx.fillRect(this.square_size * i, 0, 1, canv_height);
		}
		
		for (let i = 1; i < h; ++i) {
			this.ctx.fillRect(0, this.square_size * i, canv_width, 1);
		}
	}

	game_start(canv_width, canv_height) {
		let interval = setInterval(() => {
			if (this.game_status) {
				this.world_render(canv_width, canv_height);
			}else{
				clearInterval(interval);
			}
		}, 500);
	}

	game_over_show() {
		const message = document.querySelector('.game_over');
		message.classList.remove('hide');
		
		document.querySelector('button').onclick = () => {
			location.reload();
		};
	}
	
	world_render(canv_width, canv_height) {
		this.canvas_clear(canv_width, canv_height);
		// this.cell_render(canv_width, canv_height, canv_width / this.square_size, canv_height / this.square_size);
		this.element_render();
		this.calculate_gameplay();
	}

	calculate_gameplay() {
		const world = this.world;

		const element = [];
		const free_space = [];
		const delete_symbols = [];
		
		let gray = false;

		for (let i = world.length - 1; i >= 0; --i) {
			for (let j = world[i].length - 1; j >= 0 ; --j) {
				if (world[i][j] == '#') {
					element.push([i, j]);

					let down_symbol;
					try {
						down_symbol = world[i + 1][j];
					} catch (error) {
						down_symbol = null;
					}
					
					let top_symbol;
					try {
						top_symbol = world[i - 1][j];
					} catch (error) {
						top_symbol = null;
					}

					// down f
					if (down_symbol == 'f' || down_symbol == null) {
						// gray = true
						gray = true;
						continue;
					}

					if (top_symbol == null) {
						delete_symbols.push([i, j]);
						free_space.push([i + 1, j]);
					}

					// down #
					if (down_symbol == '#' && top_symbol != null) {
						// top # - continue
						if (top_symbol == '#') {
							continue;
						}
						
						// top ' ' - del
						if (top_symbol == ' ') {
							delete_symbols.push([i, j]);
							continue;
						}
					}

					// down ' '
					if (down_symbol == ' ' && top_symbol != null) {
						// top # - under push in free_space
						if (top_symbol == '#') {
							free_space.push([i + 1, j]);
							continue;
						}

						// top ' ' - under push in free_space and select symbol push in del
						if (top_symbol == ' ') {
							delete_symbols.push([i, j]);
							free_space.push([i + 1, j]);
							continue;
						}
					}
				}
			}
		}

		if (gray) { 
			this.select_element = null;
			this.create_element();
			this.select_element.show(world, this);
			this.fill_gray(world, element); 
			if (world[0].includes('f')) {
				this.game_status = false;
				this.game_over_show();
			}
			return;
		}

		this.ckeck_side();

		this.drop_down(world, free_space, delete_symbols);
	}

	ckeck_side() {
		// check side and move to the side
		// side: left || right
	}

	drop_down(world, free_space, delete_symbols) {
		for (let i = 0; i < free_space.length; ++i) {
			const [l, j] = free_space[i];
			world[l][j] = '#';
		}

		for (let i = 0; i < delete_symbols.length; ++i) {
			const [l, j] = delete_symbols[i];
			world[l][j] = ' ';
		}

		this.select_element.position_update();
	}

	fill_gray(world, element) {
		// refill gray color;
		for (let i = 0; i < element.length; ++i) {
			const [l, j] = element[i];
			world[l][j] = 'f';
		}
	}

	element_render() {
		for (let i = 0; i < this.world.length; ++i) {
			for (let j = 0; j < this.world[i].length; ++j) {
				const symbol = this.world[i][j];

				switch(symbol) {
					case '#': this.square_render(i, j, this.select_element.get_color()); break;
					case 'f': this.square_render(i, j, 'gray'); break;
					case ' ': continue;
					default: console.error(`undefined symbol in render = ${symbol}`);
				}
			}
		}
	}

	square_render(i, j, color) {
		const tmp_color = this.ctx.fillStyle;

		i *= this.square_size;
		j *= this.square_size;

		this.ctx.fillStyle = color;
		this.ctx.fillRect(j, i, this.square_size, this.square_size);
		this.ctx.fillStyle = tmp_color;
	}

	canvas_clear(canv_width, canv_height) {
		const tmp_color = this.ctx.fillStyle;

		this.ctx.fillStyle = 'lavender';
		this.ctx.fillRect(0, 0, canv_width, canv_height);
		
		this.ctx.fillStyle = tmp_color;
	}
};

new Tetris;
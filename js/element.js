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
		switch(form) { 
			// forms: ['square', 'line', 'g', 'one'],
			case 'one': return [];
			case 'square': { this.i += 1; return ['u', 'r', 'd']; }
			case 'line': { this.i += 2; return ['u', 'u', 'd', 'd', 'd']; }
			case 'g': { return ['r', 'l', 'd', 'd']; }
			case 'g2': { return ['l', 'r', 'd', 'd']; }
			case 'z': { return ['l', 'r', 'd', 'r']; }
			case 'z2': { return ['r', 'l', 'd', 'l']; }
			default: throw (`undefined form: ${form}`);
		}
	}

	show(world, tetris) {
		if (!world) { throw (`world is not defined: ${world}`); }
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
				default: throw (`error side: ${side}`);
			}

			if (world[i][j] == null) {
				throw ('is null');
			}

			if (world[i][j] == 'f') {
				tetris.game_status = false;
				tetris.game_over_show();
				return;
			}else{
				world[i][j] = symb;
			}
		}
	}

	position_update(i = null, j = null) {
		this.i = i ?? this.i;
		this.j = j ?? this.j;
	}

	rotate(world, tetris) {
		const backup = Array.from(this.form);

		try {
			if (this.type == 'square' || this.type == 'one') { return; }
			
			// d-l, l-u, u-r, r-d
			for (let i = 0; i < this.form.length; ++i) {
				switch(this.form[i]) {
					case 'd': this.form[i] = 'l'; break;
					case 'l': this.form[i] = 'u'; break;
					case 'u': this.form[i] = 'r'; break;
					case 'r': this.form[i] = 'd'; break;
					default: throw (`undefined form element: ${i} in ${form}`);
				}
			}
			
			tetris.clear_element();
			this.show(world, tetris);
		} catch (error) {
			this.form = backup;
			tetris.clear_element();
			this.show(world, tetris);
		}
	}

	move_left() {
		--this.j;
	}
	
	move_right() {
		++this.j;
	}

	get_color() {
		return this.color;
	}

	get_position() {
		return [this.i, this.j];
	}
};
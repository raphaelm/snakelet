var snake = {

	state: {},
	_el_container: null,
	_el_target: null,
	_el_segments: [],

	init_draw: function () {
		snake._el_container = document.createElement('div');
		document.body.appendChild(snake._el_container);
		document.body.style.overflow = "hidden";
	},

	draw_state: function () {
		if (snake._el_target === null) {
			snake._el_target = document.createElement('div');
			snake._el_target.style.position = "absolute";
			snake._el_target.style.height = "5px";
			snake._el_target.style.width = "5px";
			snake._el_target.style.background = "#c333c3";
			snake._el_container.appendChild(snake._el_target);
		}
		snake._el_target.style.left = snake.state.target[0];
		snake._el_target.style.top = snake.state.target[1];

		while (snake._el_segments.length > snake.state.segments.length) {
			var el = snake._el_segments.shift();
			snake._el_container.removeChild(el);
		}
		while (snake.state.segments.length > snake._el_segments.length) {
			var i = snake._el_segments.length;
			var el_seg = document.createElement('div');
			el_seg.style.position = "absolute";
			el_seg.style.height = "5px";
			el_seg.style.width = "5px";
			el_seg.style.background = "#33c33c";
			el_seg.style.left = snake.state.segments[i][0];
			el_seg.style.top = snake.state.segments[i][1];
			snake._el_segments.push(el_seg);
			snake._el_container.appendChild(el_seg);
		}
		for (var j = 0; j < snake.state.segments.length; j++) {
			snake._el_segments[j].style.left = snake.state.segments[j][0];
			snake._el_segments[j].style.top = snake.state.segments[j][1];
		}
	},

	iterate: function () {
		// Cut the tail
		var tail = snake.state.segments.shift();

		// Create the new head
		var newseg = (
			snake.state.segments.length > 0
			? snake.state.segments[snake.state.segments.length - 1].slice(0)
			: tail
		);
		newseg[0] = (newseg[0] + snake.state.direction[0] * 5) % window.innerWidth;
		if (newseg[0] < 0) {
			newseg[0] += window.innerWidth;
		}
		newseg[0] -= newseg[0] % 5;
		newseg[1] = (newseg[1] + snake.state.direction[1] * 5) % window.innerHeight;
		if (newseg[1] < 0) {
			newseg[1] += window.innerHeight;
		}
		newseg[1] -= newseg[1] % 5;
		snake.state.segments.push(newseg);

		if (newseg[0] === snake.state.target[0] && newseg[1] === snake.state.target[1]) {
			snake.add_segment();
			snake.state.target = snake.random_position();
			snake.state.speed *= 1.2;
		}

		if (snake.has_collision()) {
			snake.lose();
			snake.clear_state();
		}
		snake.draw_state();
		snake.save_state();
		window.setTimeout(snake.iterate, 1000 / snake.state.speed);
	},

	_bg_red: function () {
		document.body.style.background = "#990000";
	},

	_bg_white: function () {
		document.body.style.background = "#FFFFFF";
	},

	lose: function () {
		window.setTimeout(snake._bg_red, 0);
		window.setTimeout(snake._bg_white, 150);
		window.setTimeout(snake._bg_red, 300);
		window.setTimeout(snake._bg_white, 450);
		window.setTimeout(snake._bg_red, 600);
		window.setTimeout(snake._bg_white, 750);
	},

	has_collision: function () {
		for (var i = 0; i < snake.state.segments.length; i++) {
			for (var j = 0; j < snake.state.segments.length; j++) {
				if (i === j) continue;
				if ((snake.state.segments[i][0] === snake.state.segments[j][0]) && (snake.state.segments[i][1] === snake.state.segments[j][1]))
					return true;
			}
		}
		return false;
	},

	add_segment: function () {
		var newseg = snake.state.segments[snake.state.segments.length - 1].slice(0);
		newseg[0] = (newseg[0] + snake.state.direction[0] * 5) % window.innerWidth;
		if (newseg[0] < 0) {
			newseg[0] += window.innerWidth;
		}
		newseg[0] -= newseg[0] % 5;
		newseg[1] = (newseg[1] + snake.state.direction[1] * 5) % window.innerHeight;
		if (newseg[1] < 0) {
			newseg[1] += window.innerHeight;
		}
		newseg[1] -= newseg[1] % 5;
		snake.state.segments.push(newseg);
	},

	random_position: function () {
		var h = window.innerHeight - 220 - 20,
			w = window.innerWidth - 20;
		var basex = Math.round(Math.random() * w),
			basey = Math.round(Math.random() * h);
		return [10 + basex - (basex % 5), 230 + basey - (basey % 5)];
	},

	start_state: function () {
		return {
			target: snake.random_position(),
			segments: [[0, Math.min(310, (window.innerHeight - (window.innerHeight % 5)) - 20)]],
			speed: 5,
			direction: [1, 0]
		};
	},

	load_state: function () {
		var raw = window.sessionStorage.getItem('snake_state');
		if (raw === null) {
			snake.state = snake.start_state();
		} else {
			snake.state = JSON.parse(raw);
		}
	},

	save_state: function () {
		window.sessionStorage.setItem('snake_state', JSON.stringify(snake.state));
	},

	clear_state: function () {
		window.sessionStorage.removeItem('snake_state');
		snake.state = snake.start_state();
		snake.draw_state();
	},

	keydown: function (event) {
		var keyCode = event.which || event.keyCode;
		if (keyCode === 40) {
			// down
			snake.state.direction = [0, 1];
		} else if (keyCode === 38) {
			// up
			snake.state.direction = [0, -1];
		} else if (keyCode === 37) {
			// left
			snake.state.direction = [-1, 0];
		} else if (keyCode === 39) {
			// right
			snake.state.direction = [1, 0];
		}
	},

	_touch_start: null,

	touch_start: function (event) {
		var touches = event.changedTouches;
		snake._touch_start = [touches[0].pageX, touches[0].pageY];
	},

	touch_end: function (event) {
		var touches = event.changedTouches;
		end_pos = [touches[0].pageX, touches[0].pageY];
		var dX = end_pos[0] - snake._touch_start[0],
			dY = end_pos[1] - snake._touch_start[1],
			c = Math.sqrt(dX*dX + dY*dY),
			alpha = Math.acos(dX/c);

		if (alpha < Math.PI * 1/4) {
			snake.state.direction = [1, 0];
		} else if (alpha > Math.PI * 3/4) {
			snake.state.direction = [-1, 0];
		} else if (dY > 0) {
			snake.state.direction = [0, 1];
		} else {
			snake.state.direction = [0, -1];
		}
	},

	init: function () {
		snake.load_state();
		snake.init_draw();
		snake.draw_state();

		window.onkeydown = snake.keydown;

		document.body.addEventListener("touchstart", snake.touch_start, false);
		document.body.addEventListener("touchend", snake.touch_end, false);

		window.setTimeout(snake.iterate, 500);
	}
};
window.onload = snake.init();

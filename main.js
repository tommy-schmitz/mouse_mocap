// Initialize the 'ui' object.
const main = modules.define('main')
.import('input')
.import('game')
.import('util')
.export(function (defs) {
	
const {util, input, game} = defs;

util.run_async(function*(resume) {
////////////////////////////////////////////////////////////////////////
// MAIN THREAD
	
	// Wait until the window 'load' event
	window.addEventListener('load', resume);
	yield;
	
	// Initialize canvas
	game.initCanvas();
	
	// Initialize input
	input.init();
	

const draw_button = function(ctx, {x, y, w, h, color, caption}) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, w, h);
	ctx.fillStyle = 'black';
	ctx.font = Math.floor(.8*h) + 'px sans-serif';
	ctx.fillText(caption, x+.2*h, y+.8*h);
};
const over_button = function({x, y, w, h}) {
	return input.mx >= x && input.mx < x+w && input.my >= y && input.my < y+h;
};
const save_button = {
	x: game.WIDTH-100,
	y: game.HEIGHT-32,
	w: 100,
	h: 32,
	color: '#88f',
	caption: 'Save',
};

const line = function(ctx, x0, y0, x1, y1) {
	ctx.beginPath();
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.stroke();
};
const draw_paper_lines = function(ctx) {
	ctx.fillStyle = 'black';
	ctx.font = '24px sans-serif';
	ctx.fillText('start:', 15, 130);

	ctx.strokeStyle = 'blue';
	for(let i=0; i<10; ++i)
		line(ctx, 0, 100+50*i, game.WIDTH, 100+50*i);
	
	ctx.strokeStyle = 'red';
	line(ctx, 100, 0, 100, game.HEIGHT);
};

const compile_path = function(buffer) {
	let n = 1;

	let result = 'public static AIBehavior.Motion[] anim_0 = new AIBehavior.Motion[]{\n';
	for(b of buffer)
		util.dispatch(b, {
			split() {
				result +=
`\
};
public static AIBehavior.Motion[] anim_` + n + ` = new AIBehavior.Motion[]{
`;

				++n;
			},
			DEFAULT({type,t,x,y}) {
				result += '    new AIBehavior.Motion("' + type + '", ' + t
				        + ', ' + x + ', ' + y + '),\n';
			},
		});
	result += '};\n';
	return result;
};

const download_string = function(string) {
	string = encodeURIComponent(string);
	const a = document.createElement('a');
	a.href = 'data:attachment/plaintext,' + string;
	a.target = '_blank';
	a.download = 'blah.path';
	document.body.appendChild(a);
	a.click();
};

const old_bufs = game.old_bufs = [];
const buf = game.buf = [];
const save = game.save = function() {
	const string = compile_path(buf);

	// Download the string
	download_string(string);

	// Preserve the buf
	const preserve = [];
	Array.prototype.push.apply(preserve, buf);
	old_bufs.push(preserve);

	// Clear the buf
	buf.length = 0;
};

const reset_paper = function(ctx) {
	ctx.clearRect(0, 0, game.WIDTH, game.HEIGHT);
	draw_paper_lines(ctx);
};

const cancel = function() {
	single_buf.length = 0;

	start_time = Date.now();
	single_buf.push(split);
	single_buf.push(make_moved());
	reset_paper(my_ctx);
};
const confirm = function() {
	Array.prototype.push.apply(buf, single_buf);
	single_buf.length = 0;

	start_time = Date.now();
	single_buf.push(split);
	single_buf.push(make_moved());
	reset_paper(my_ctx);
};

const split = {type: 'split'};
const make_moved = () =>
	({type: 'moved', t: Date.now()-start_time, x: input.mx, y: input.my});
const make_dragged = () =>
	({type: 'dragged', t: Date.now()-start_time, x: input.mx, y: input.my});
const make_dot = () =>
	({type: 'dot', t: Date.now()-start_time, x: input.mx, y: input.my});

window.onbeforeunload = function(e) {
	const msg = 'Are you sure you want to quit?';
	e.returnValue = msg;
	return msg;
};

const single_buf = game.single_buf = [];
let mousedown = false;
let prev_x = 0;
let prev_y = 0;
let start_time = Date.now();
var my_ctx = null;
game.ui = {
	draw(ctx) {
		if(my_ctx === null) {
			my_ctx = ctx;
			reset_paper(ctx);
		}
		draw_button(ctx, save_button);
	},
	mouse_moved({mx, my}) {
		if(mousedown) {
			single_buf.push(make_dragged());
			my_ctx.strokeStyle = 'black'
			line(my_ctx, prev_x+.5, prev_y+.5, mx+.5, my+.5);
		} else {
			single_buf.push(make_moved());
		}

		prev_x = mx;
		prev_y = my;
	},
	tick(elapsed) {
	},
	mouse_clicked({mx, my}) {
		if(over_button(save_button)) {
			confirm();
			save();
		} else {
			mousedown = true;
			single_buf.push(make_dot());
		}
	},
	mouse_released() {
		mousedown = false;
	},
	key_pressed(ev) {
		if(ev.ev.keyCode === 32)
			confirm();
		else if(ev.ev.keyCode === 27)
			cancel();
	},
};
console.log('arg');

	
// END OF MAIN THREAD
////////////////////////////////////////////////////////////////////////

});

});

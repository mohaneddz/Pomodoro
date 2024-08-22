'use strict';

import * as df from './config.js';

// select by id
const intervals = document.getElementById('intervals');
const focus = document.getElementById('focus');
const rest = document.getElementById('rest');
const blur = document.getElementById('blur');
const themeRadioButtons = document.querySelectorAll('input[name="theme"]');
const errorMessage = document.getElementById('error-message');
const apply = document.getElementById('apply');
const reset = document.getElementById('reset');
const fields = [focus, rest];
const backgroundImage = document.getElementById('background');
let theme = localStorage.getItem('theme') || df.DEFAULT_THEME;
const root = document.documentElement;

df.setTheme(localStorage.getItem('theme') || df.DEFAULT_THEME);

function init_settings() {
	/**
	 * Initialize the settings page with the values from local storage
	 * or the default values if no values are stored.
	 * @returns {void}
	 */
	let imageUrl = localStorage.getItem('backgroundImage') || df.DEFAULT_BACKGROUND;

	let _focus = localStorage.getItem('focus') || df.DEFAULT_FOCUS_TIME;
	let _rest = localStorage.getItem('rest') || df.DEFAULT_REST_TIME;

	intervals.value = localStorage.getItem('intervals') || df.DEFAULT_MAX_ROUNDS;
	blur.value = localStorage.getItem('blur') || df.DEFAULT_BLUR;

	focus.value = get_time_setting(_focus);
	rest.value = get_time_setting(_rest);
	df.setbackground(imageUrl || df.DEFAULT_BACKGROUND);
	df.setblur(localStorage.getItem('blur') || df.DEFAULT_BLUR);

	// applying the theme now :
	if (theme === 'Lagoon') themeRadioButtons[0].checked = true;
	else if (theme === 'Owl') themeRadioButtons[1].checked = true;
	else if (theme === 'Monkai') themeRadioButtons[2].checked = true;
}

function get_time_setting(time) {
	let seconds = Math.floor((time / 1000) % 60);
	if (time > 3600 * 1000) {
		let hours = Math.floor((time / 3600) * 1000);
		let minutes = Math.floor(time / (60 * 1000) - hours * 60);

		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}}`;
	} else {
		let minutes = Math.floor(time / (60 * 1000));
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}
}

reset.addEventListener('click', (e) => {
	e.preventDefault();
	localStorage.setItem('intervals', df.DEFAULT_MAX_ROUNDS);
	localStorage.setItem('focus', df.DEFAULT_FOCUS_TIME);
	localStorage.setItem('rest', df.DEFAULT_REST_TIME);
	localStorage.setItem('blur', df.DEFAULT_BLUR);
	localStorage.setItem('theme', df.DEFAULT_THEME);
	localStorage.setItem('backgroundImage', df.DEFAULT_BACKGROUND);
	df.setbackground(df.DEFAULT_BACKGROUND);
	init_settings();
});

apply.addEventListener('click', (e) => {
	// store values in local storage
	let imageUrl = localStorage.getItem('backgroundImage') || df.DEFAULT_BACKGROUND;

	e.preventDefault();
	if (errorMessage.style.display === 'inline') {
		return;
	}

	intervals && localStorage.setItem('intervals', intervals.value);
	focus && localStorage.setItem('focus', parse_duration(focus.value));
	rest && localStorage.setItem('rest', parse_duration(rest.value));
	blur && localStorage.setItem('blur', blur.value);
	theme = document.querySelector('input[name="theme"]:checked').value;
	localStorage.setItem('theme', theme);
	localStorage.setItem('backgroundImage', imageUrl);
	df.setTheme(theme);
	df.setblur(blur.value);
	// back to the index
});

// Setting the error message
fields.forEach((field) => {
	field.addEventListener('submit', function (event) {
		const duration = focus.value;
		try {
			parse_duration(duration); // Re-validate on form submission
		} catch (err) {
			event.preventDefault(); // Prevent form submission if invalid
		}
	});

	field.addEventListener('input', function () {
		const duration = this.value;

		try {
			parse_duration(duration); // Try to parse the duration
			this.setCustomValidity(''); // Clear any previous invalid state
			errorMessage.style.display = 'none'; // Hide error message
		} catch (err) {
			this.setCustomValidity('Invalid time format'); // Set the field as invalid
			errorMessage.style.display = 'inline'; // Show error message
		}
	});
});

function parse_duration(duration) {
	const timeFormat = /^(\d+)(?::([0-5]?\d))?(?::([0-5]?\d))?$/;

	if (duration === undefined || !timeFormat.test(duration)) throw new Error('Invalid time format');

	let hour = 0,
		min = 0,
		sec = 0;
	const parts = duration.split(':').map(Number);

	if (parts.length === 1) {
		min = parts[0]; // Only minutes are provided
	} else if (parts.length === 2) {
		[min, sec] = parts; // Minutes and seconds
	} else if (parts.length === 3) {
		[hour, min, sec] = parts; // Hours, minutes, and seconds
	}

	return (hour * 3600 + min * 60 + sec) * 1000;
}

backgroundImage.addEventListener('change', function (event) {
	const file = event.target.files[0];

	if (file) {
		const reader = new FileReader();

		reader.onload = function (e) {
			const img = new Image();
			img.src = e.target.result;

			img.onload = function () {
				// Create a canvas element
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');

				// Set desired dimensions (e.g., max width and height)
				// using the dimensions of the screen
				const maxWidth = window.innerWidth;
				const maxHeight = window.innerHeight;
				let width = img.width;
				let height = img.height;

				// Calculate new dimensions while maintaining aspect ratio
				if (width > height) {
					if (width > maxWidth) {
						height *= maxWidth / width;
						width = maxWidth;
					}
				} else {
					if (height > maxHeight) {
						width *= maxHeight / height;
						height = maxHeight;
					}
				}

				// Set canvas dimensions
				canvas.width = width;
				canvas.height = height;

				// Draw the resized image on the canvas
				ctx.drawImage(img, 0, 0, width, height);

				// Convert the canvas to a data URL
				const resizedImageUrl = canvas.toDataURL('image/jpeg'); // You can use 'image/png' if needed

				// Apply the resized image as background
				df.setbackground(resizedImageUrl);
				// Optional: Save the resized image URL to local storage
				localStorage.setItem('backgroundImage', resizedImageUrl);
			};
		};

		reader.readAsDataURL(file);
	}
});



// init main
init_settings();

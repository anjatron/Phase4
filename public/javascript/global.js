var table_data = [];

// Script to handle our submission
$(document).ready(function () {
	handleFormInput();

	// $('#tableWrapper').hide();
	populateCallHistoryTable();

	$('#callHistory table tbody').on('click', 'tr td a.callAgain', function () {
		event.preventDefault();

		var timestamp = $(this).attr('rel');
		callAgain(timestamp);
	});
});

// Create the call history table
function populateCallHistoryTable() {
	var table_content = '';

	$.getJSON('/phonebuzz/callHistory', function (data) {
		table_data = data;

		$.each(data, function() {
			table_content += '<tr>';
			table_content += '<td>' + this.phone_number + '</td>';
			table_content += '<td>' + this.timestamp + '</td>';
			table_content += '<td>' + this.delay + '</td>';
			table_content += '<td><a href="#" class="callAgain" rel="' + this.timestamp + '">Call Again</a></td>';
			table_content += '</tr>';
		});

		$('#callHistory table#dataTable tbody').html(table_content);
	});
}

// Get user input and ask the server to make a call
function handleFormInput() {
	event.preventDefault();

	$('#numberForm').on('click', function (event) {
		var number = document.getElementById('phone_number').value;
		var delay = document.getElementById('time_delay').value;

		if (number !== '' && delay !== '') {

			if (validateNumber(number)) {
				var data = {
					phone_number: number,
					delay: delay
				}

				$.ajax({
					type: 'POST',
					url: '/phonebuzz/placeCall',
					data: data,
					dataType: 'json'
				})
				.done(function (data) {
					document.getElementById('phone_number').value = '';	
					document.getElementById('time_delay').value = '';

					populateCallHistoryTable();
				})
				.fail(function (error) {
					alert(JSON.stringify(error));
				});
			} else {
				alert('You must enter a valid phone number. EX: 5558978 or +15558978');
			}
		}
	});
}

// Let's see what the past game resutls were
function callAgain(timestamp) {
	event.preventDefault();

	if (timestamp !== undefined) {
		var thisCall = table_data.find(function (call) {
			return call.timestamp === timestamp;
		});

		$.ajax({
			type: 'GET',
			url: '/phonebuzz/callAgain',
			data: thisCall
		})
		.done(function (res) {
			alert('Successfully trying to re-dial...');

			populateCallHistoryTable();
		})
		.fail(function (res) {
			alert('Error re-dialing!');
		});
	}
}

// Make sure the user is entering a valid number
function validateNumber(number) {
	var numRegex = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;

	if (number.match(numRegex)) return true;

	return false
}


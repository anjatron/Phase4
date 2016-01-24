// Script to handle our submission
$(document).ready(function () {
	handleFormInput();
});

function handleFormInput() {
	event.preventDefault();

	$('#numberForm').on('click', function (event) {
		var number = document.getElementById('phone_number').value;

		if (validateNumber(number)) {
			var data = {
				phone_number: number
			}

			$.ajax({
				type: 'POST',
				url: '/phonebuzz/placeCall',
				data: data,
				dataType: 'json'
			})
			.done(function (data) {
				document.getElementById('phone_number').value = '';	
			})
			.fail(function (error) {
				alert(JSON.stringify(error));
			});
		} else {
			alert('You must enter a valid phone number. EX: 5558978 or +15558978');
		}
	});
}

// Make sure the user is entering a valid number
function validateNumber(number) {
	var numRegex = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;

	if (number.match(numRegex)) return true;

	return false
}
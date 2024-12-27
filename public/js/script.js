

document.getElementById('reviewForm').addEventListener('submit', function(event) {
  let valid = true;
  const ratingInputs = document.querySelectorAll('input[name="review[rating]"]');
  const commentInput = document.getElementById('comment');

  if (![...ratingInputs].some(input => input.checked)) {
    valid = false;
    alert('Rating is required');
  }

  if (commentInput.value.length < 10) {
    valid = false;
    alert('Comment must be at least 10 characters long');
  }

  if (!valid) {
    event.preventDefault();
  }
});

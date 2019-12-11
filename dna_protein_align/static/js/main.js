function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function post (url, options) {
  const csrftoken = getCookie('csrftoken');
  const defaults = {
    'method': 'POST',
    'credentials': 'include',
    'headers': new Headers({
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
      })
  };
  const merged = {...options, ...defaults};
  return fetch(url, merged);
}

window.onload = function () {
  document.getElementById("submit").onclick = function () {
    // post needs two params as it's written
    let seq = document.getElementById("id_seq").value;
    let remove = document.getElementById("id_remove_search_history").value;
    post("", {
      "body" : JSON.stringify({
        "seq" : seq,
        "remove_search_history" : remove
    })}).then((response) => {
      return response.json();
    }).then(data => {
      if (data.validation_throws) {
        const para8 = document.createElement("p");
        const para8_text = document.createTextNode(data.validation_error_message);
        para8.appendChild(para8_text);
        document.documentElement.appendChild(para8);
      } else {
        if (data.result_found) {
          const para1 = document.createElement("p");
          const para1_text = document.createTextNode("Sequence found in protein: ".concat(data.protein_name));
          para1.appendChild(para1_text);
          const para2 = document.createElement("p");
          const para2_text = document.createTextNode("Location on protein: Base pair ".concat(data.protein_index));
          para2.appendChild(para2_text);
          document.documentElement.appendChild(para1);
          document.documentElement.appendChild(para2);
        } else {
          const para3 = document.createElement("p");
          const para3_text = document.createTextNode("Sequence not found");
          para3.appendChild(para3_text);
          document.documentElement.appendChild(para3);
        }
      }
      // Updates previous searches from JSON returned by POST
      const prev_div = document.getElementById("prev_div");
      document.documentElement.removeChild(prev_div);
      update_prev_searches(data.previous_searches);
    }).catch((response) => console.log(response));
  };
  // Updates previous searches from cookie
  update_prev_searches(previous_searches)
};

// Returns reference to previous searches node so it can be removed later
function update_prev_searches (previous_searches) {
  const prev_div = document.createElement("div");
  prev_div.setAttribute("id", "prev_div");
  if (previous_searches.length > 1) {
    const para4 = document.createElement("p");
    const para4_text = document.createTextNode("Previous searches");
    para4.appendChild(para4_text);
    prev_div.appendChild(para4);
    const len = previous_searches.length;
    // Most recent five searches excluding current one - as of now, this may cause duplicating or skipping behavior
    for (let i = len - 2; i >= 0 && i > len - 7; i--) {
      let ul = document.createElement("ul");
      let li5 = document.createElement("li");
      let li5_text = document.createTextNode("Sequence: ".concat(previous_searches[i][0]));
      li5.appendChild(li5_text);
      let li6 = document.createElement("li");
      let li6_text = document.createTextNode("Protein: ".concat(previous_searches[i][1]));
      li6.appendChild(li6_text);
      let li7 = document.createElement("li");
      let li7_text = document.createTextNode("Location on protein: ".concat(previous_searches[i][2]));
      li7.appendChild(li7_text);
      ul.appendChild(li5);
      ul.appendChild(li6);
      ul.appendChild(li7);
      prev_div.appendChild(ul);
    }
  }
  document.documentElement.append(prev_div);
}
  
  
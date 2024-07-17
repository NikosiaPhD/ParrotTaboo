const apiUlrs = {
    "OpenAI": "https://api.openai.com/v1/chat/completions",
    "Groq": "https://api.groq.com/openai/v1/chat/completions"
}

var apiKey = "";
var model = "";
var provider = "";
var temperature = 1.0;
var max_tokens = 100;

var codeword = "";
var word_list = []
var messages = [];

var only_legal_text = true;

const conversation_starters = [
    "tell a story from your childhood!", 
    "tell us what you have done today!",
    "tell us your plans for the weekend!",
    "tell a joke!",
    "ask the user a question!",
    "tell us about your favorite movie and why it is your favourite!",
]

const codewords = ["Apple", "Banana", "Grape", "Orange", "Peach", "Pear", "Pineapple", "Strawberry", "Watermelon", "Blueberry", "Cat", "Dog", "Bird", "Fish", "Elephant", "Tiger", "Lion", "Bear", "Monkey", "Kangaroo", "House", "School", "Park", "Beach", "Mountain", "River", "Forest", "City", "Village", "Farm", "Car", "Bicycle", "Bus", "Train", "Airplane", "Boat", "Truck", "Motorcycle", "Scooter", "Subway", "Chair", "Table", "Bed", "Sofa", "Door", "Window", "Roof", "Floor", "Wall", "Stairs", "Red", "Blue", "Green", "Yellow", "Purple", "Panda", "Black", "White", "Pink", "Brown", "Pizza", "Sandwich", "Salad", "Soup", "Bread", "Cheese", "Chicken", "Beef", "Egg", "Rice", "Spring", "Summer", "Fall", "Winter", "Rain", "Snow", "Sun", "Moon", "Cloud", "Star", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Morning", "Afternoon", "Evening", "Night", "Happy", "Sad", "Angry", "Excited", "Scared", "Hungry", "Thirsty", "Sleepy"]



const chatbox = document.getElementById("chat-window");
const task_element = document.getElementById("task");
const word_list_element = document.getElementById("word-list");
const chatbox_container = document.getElementById("input-area");
const editable_input = document.getElementById("highlight_editable");
const highlight_input = document.getElementById("highlight_colors");
const input_hint_element = document.getElementById("input-hint");



async function generate_response(messages) {
    // fetches a response from the LLM API
    
    // example usage:
    // getResponse([{role: "system", content: "Hello, how are you?"}])
    //     .then(response => {
    //         console.log(response); // This will log the actual response or error message
    // });

    console.log(temperature, typeof temperature, max_tokens, typeof max_tokens);

    const data = {
        messages: messages,
        model: model,
        temperature: temperature,
        max_tokens: max_tokens,
    };

    const apiUrl = apiUlrs[provider];

    // Return the fetch promise chain
    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        const response = data.choices[0].message.content;
        console.log('Got Response:', response);
        return response; // This will be the resolved value of the promise returned by getResponse
    })
    .catch((error) => {
        console.error('Error:', error);
        return "An error occurred. Check the logs for details."; // This will also be a resolved value of the promise
    });
};





const update_highlight = (el) => {
    // update the highlighted text to match the input text but highlight illegal words

    only_legal_text = true;
    input_hint_element.classList.remove("warning")

    text = editable_input.innerHTML
    text = text.replace(/&nbsp;/g, "");

    // split by spaces
    words = text.split(" ");

    // Process each word
    const processedWords = words.map(word => {

        // Check if the word is not in the list
        if (word_list.includes(word.replace(/[^a-zA-Z ]/g, "").toLowerCase())) {
            // Word is in the list, return it without highlighting
            return word;
        } else {
            // Word is not in the list, highlight it
            only_legal_text = false;
            return `<span class="highlighted_word">${word}</span>`;
        }
    });

    // Join the processed words back into a string
    highlight_input.innerHTML = processedWords.join(' ');

};

editable_input.addEventListener("input", update_highlight);




function add_message(message, role) {
    // add message to chatbox: <div class="message user">Message 2</div>
    // role is either "user", "assistant", or "system" (for win messages)

    const message_element = document.createElement("div");
    message_element.classList.add("message");
    message_element.classList.add(role);
    if(role == "system") {
        message_element.innerHTML = message;
    } else {
        message_element.innerText = message;
    }
    chatbox.prepend(message_element);
}



editable_input.addEventListener("keydown", async (e) => {
    // when the user presses enter on the input box, check whether it's legal and then send it to the LLM. Also processes the response

    if (e.key === "Enter") {
        e.preventDefault();
        const message = editable_input.innerHTML;

        // check if message is empty
        if (message.replace(/&nbsp;/g, "").trim() === "") {
            return;
        }

        if (!only_legal_text) {

            input_hint_element.classList.add("warning")

            input_hint_element.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(0)' }
            ], {
                duration: 500,
                iterations: 1
            });


            return;

        } else { // legal message

            editable_input.innerHTML = "";
            highlight_input.innerHTML = "";

            // add to history (for generation)
            messages.push({role: "user", content: message});

            // display messsage
            add_message(message, "user");


            // Get response
            generate_response(messages).then(response => {

                // display messsage
                add_message(response, "assistant");

                // add to history (for generation)
                messages.push({role: "assistant", content: response});

                // add words from message (also checks win)
                add_allowed_words(response);
            });
        }
    }
});


async function reset_game() {
    // start a new game

    // check if api key is set
    if (apiKey == "") {
        return;
    }

    messages = [];
    word_list = [];
    chatbox.innerHTML = "";
    editable_input.innerHTML = "";
    highlight_input.innerHTML = "";
    codeword = codewords[Math.floor(Math.random() * codewords.length)];
    task_element.innerText = "Your task: Make the AI say \""+codeword+"\"";
    codeword = codeword.toLowerCase();

    // add conversation starter
    const message = "You are a helpful assistant. Try your best to respond to the user's messages. Respond in plain text without markdown syntax like asterisks or hashtags. In the beginning of the conversation, please introduce yourself and " + conversation_starters[Math.floor(Math.random() * conversation_starters.length)];

    generate_response([{"role" : "system", "content" : message}]).then(response => {
        // display messsage
        add_message(response, "assistant");

        // add to history (for generation)
        messages.push({role: "assistant", content: response});

        // add words from message (also checks win)
        add_allowed_words(response);
    });
}


function add_allowed_words(message) {
    // add words to word_list

    // replace all linebreaks with spaces
    message = message.replace(/(\r\n|\n|\r)/gm, " ");

    message = message.replace("/", " ");
    message = message.replace("-", " ");

    // reduce all whitespace to one space
    message = message.replace(/\s+/g, " ");

    // remove all special characters
    message = message.replace(/[^a-zA-Z ]/g, "");

    const words = message.split(" ");

    words.forEach((word) => {

        word = word.toLowerCase();

        if (!word_list.includes(word)) {
            word_list.push(word);
            const word_element = document.createElement("span");
            word_element.innerHTML = word;
            word_element.classList.add("word");
            word_list_element.appendChild(word_element);

            // check if word == codeword
            if (word == codeword) {
                // win
                add_message('<b class="warning">You won after '+messages.length+' messages!</b><br>Click the restart buttom in the top right to play again!", "system');
            }

        }
    });
}


// EVERYTHING SETTINGS-RELATED //

const settings_panel = document.getElementById("settingssettings-panel");
const settingsBtn = document.getElementById("settings-button");
const closeBtn = document.querySelector(".close");
const settingsForm = document.getElementById("settingsForm");

// Open the settings-panel
settingsBtn.onclick = function() {
    settings_panel.style.display = "flex";
}

// Close the settings-panel
closeBtn.onclick = function() {
    settings_panel.style.display = "none";
}

// Close the settings-panel if clicked outside
window.onclick = function(event) {
    if (event.target == settings_panel) {
        settings_panel.style.display = "none";
    }
}


const temperature_slider = document.getElementById("generation-temperature");
const temperature_label = document.getElementById("generation-temperature-label");
temperature_slider.value = temperature;
temperature_label.innerText = "Temperature: " + temperature;

temperature_slider.oninput = function() {
    temperature_label.innerText = "Temperature: " + this.value;
    temperature = parseFloat(this.value);
}



const length_slider = document.getElementById("response-length");
const length_label = document.getElementById("response-length-label");
length_slider.value = max_tokens;
length_label.innerText = "Response Length: " + max_tokens;

length_slider.oninput = function() {
    length_label.innerText = "Response Length: " + this.value;
    max_tokens = parseInt(this.value);
}


const model_selector = document.getElementById("model-selector");

model_selector.onchange = function() {
    var model_selection = this.value;
    // model_selection is a string with the provider, then a space, and then the model name
    [provider, model_name] = model_selection.split(" ");

    if(provider == "OpenAI") {
        api_key_input_label.innerText = "OpenAI API Key (starts with \'sk-\'):";
    } else if(provider == "Groq") {
        api_key_input_label.innerText = "Groq API Key (starts with \'gsk-\'):";
    } else{
        return;
    }

    model = model_name;
}


const api_key_input = document.getElementById("api-key");
const api_key_input_label = document.getElementById("api-key-label");

api_key_input.oninput = function() {
    apiKey = this.value;
    task_element.innerText = "Click the restart button to start the game >>>";
}
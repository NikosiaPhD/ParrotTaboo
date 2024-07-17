# Parrot Taboo 🦜
*An LLM-powered browser-based game by [NikosiaPhD](https://twitch.tv/nikosiaphd)*

### Contents

1. [How to Play](#how-to-play)
2. [Setting up the LLM API Key](#you-will-need-to-set-up-an-api-key)
3. [Technical Highlights](#technical-highlights)
4. [Maintainance and Licensing](#maintainance-and-licensing)

## How to Play
You don't need to install the game or any dependencies. You can play it [here!](http://nikosiaphd.github.io/ParrotTaboo)

1. **Goal**: Your objective is to make the AI say a specific code word displayed at the top of the screen.

2. **Twist**: You can only send messages composed of words that the AI has previously used. All other words will be highlighted in red and will prevent you from sending that message. The left section of the interface displays the list of legal words you can use.

3. **Game Settings**: You can modify the generation settings to customize your experience:
   - Adjusting the response length can increase the game's difficulty.
   - Setting the temperature above 1 may lead to more unpredictable (and potentially incoherent) AI responses.

## You Will Need to Set Up an API Key
Before starting the game, you need to obtain an API key from OpenAI or Groq (instructions on how to get these can be found on their respective websites).Then select a model from the chosen provider.

The game requires your API key to interact with the AI models. The providers use these identifiers to prevent spam. Your key is used solely for this game and is not stored or used for any other purpose.

## Technical Highlights
While JavaScript is not my main language, I am still pretty confident that this code is not the worst. Thus, this game could be a helpful reference to some learners on how to solve specific problems.:
- Front-end development (HTML, CSS, JavaScript)
- Asynchronous API calls
- Real-time text processing
- User interface design
- Game logic implementation

One particular code snippet that I want to highlight here is the real-time word highlighting. Here's a high-level explanation of how it works:

1. The input area consists of two layered `div` elements:
   - A background layer (`#highlight_colors`) for displaying highlighted text
   - A foreground layer (`#highlight_editable`) for user input

    ```html
    <div id="highlight_colors"></div>
    <div id="highlight_editable" contenteditable></div>
    ```

2. The foreground div is editable but transparent
    - This makes it look like the words the user is typing are highlighted, but it is actually a copy of the user input that is highlighted

    ```css
    #highlight_colors {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        user-select: none;
        color: var(--text-color);
    }

    #highlight_editable {
        position: relative;
        color: transparent;
        caret-color: var(--text-color);
        background-color: transparent;
    }

    .highlighted_word {
        background-color: #ff2222;
        border-radius: 5px;
    }
    ```

3. As the user types, the `update_highlight` function processes the input:
   - It splits the input into words
   - Checks each word against the allowed word list
   - Applies highlighting to disallowed words

   ```javascript
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
    ```



## Maintainance and Licensing
I consider this project complete and will not work on it any further. I will also not review any pull requests. 

Feel free to take inspiration from some of the code but do not distribute this game as a whole elsewhere in your name. Wherever you use codebits in your own projects make sure to leave a comment referring back to this repo. 

Hit me up if you have any concerns, suggestions, or questions.

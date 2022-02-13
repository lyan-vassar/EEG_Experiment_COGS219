var N_PRACTICE_QUESTIONS = 2;
var N_QUESTIONS_PER_BLOCK = 2;

var test_stimuli = [list_a, list_b, list_c, list_d];

var jsPsych = initJsPsych({});

var urlvar = jsPsych.data.urlVariables();
//decides which list is going to be used, either 0, 1, 2, 3.
var selectedNumber = urlvar.list;

//This is the timeline where we will add all the javascript variables
//(the trials and instrucitons and whatnot) so they can appear on the
//screen in chronological order
var timeline = []; //it is a variable and it is initialized as an empty list

var subject_id;

// researcher input
var researchInput = {
  type: jsPsychSurveyText,
  preamble: "Please enter the participant ID as a two digit number, e.g., 01",
  questions: [{ prompt: "Participant ID: ", required: true }],
  on_finish: function (data) {
    subject_id = data.response.Q0;
    jsPsych.data.addProperties({
      subject_id: data.response.Q0,
    });
  },
};

timeline.push(researchInput);

var enter_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: true,
};

timeline.push(enter_fullscreen);

// welcome message
var welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<p>Experimenter will read instructions for the experiment. After instructions are complete, press any key to begin.</p>",
  on_start: function () {
    document.querySelector("html").classList.add("hide-cursor");
  },
};

timeline.push(welcome);

// practice block

var practice_instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "The practice portion will begin on the next screen. Press any key to begin.",
};

var practice_sentence = "";
var practice_words = [];
//initialize the counter
var i = 0;

var practice_fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "+",
  choices: "NO_KEYS",
  trial_duration: 500,
  on_finish: function () {
    practice_sentence = jsPsych.timelineVariable("sentence");
    practice_words = practice_sentence.split(" ");
  },
  css_classes: ["big-font"],
};

var practice_sentence_loop = {
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function () {
        return practice_words[i];
      },
      choices: "NO_KEYS",
      trial_duration: function () {
        //from the pair
        return 200 + 32 * practice_words[i].length;
      },
      css_classes: ["big-font"],
    },
  ],

  loop_function: function () {
    i++;
    if (i < practice_words.length) {
      return true;
    } else {
      practice_sentence = "";
      practice_words = [];
      i = 0;
      return false;
    }
  },
};

var practice_final_word = {
  on_load: () => {
    fetch(
      `http://127.0.0.1:8000/trigger/tcp/${jsPsych.timelineVariable(
        "trigger_value"
      )}`
    );
  },
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function () {
    if (jsPsych.timelineVariable("left_or_right") == "left") {
      var ending = `<div style="position:relative; width:800px; height:60px; line-height:60px;">
            <p style="position:absolute; width:800px; text-align:center; margin:0;">+</p>
            <p style="position:absolute; right:calc(50% + 89px); margin:0;">${jsPsych.timelineVariable(
              "word"
            )}</p>
            </div>`;
    } else {
      var ending = `<div style="position:relative; width:800px; height:60px; line-height:60px;">
            <p style="position:absolute; width:800px; text-align:center; margin:0;">+</p>
            <p style="position:absolute; left:calc(50% + 89px); margin:0;">${jsPsych.timelineVariable(
              "word"
            )}</p>
            </div>`;
    }
    return ending;
  },

  choices: "NO_KEYS",
  trial_duration: 200,
  post_trial_gap: 2500,
  css_classes: ["big-font"],
  data: {
    task: 'practice-word-trigger',
    id_2: jsPsych.timelineVariable("id_2"),
    sentence: jsPsych.timelineVariable("sentence"),
    word: jsPsych.timelineVariable("word"),
    left_or_right: jsPsych.timelineVariable("left_or_right"),
    sentence_type: jsPsych.timelineVariable("sentence_type"),
    trigger_value: jsPsych.timelineVariable("trigger_value"),
  }
};

var question_mark = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<div style='color:blue; font-size:128px;'>?</div>",
  choices: "NO_KEYS",
  trial_duration: 2000,
};

var practice_question = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("question"),
  choices: ["y", "n"],
  data: {
    task: "practice-response",
    id_2: jsPsych.timelineVariable("id_2"),
    sentence: jsPsych.timelineVariable("sentence"),
    word: jsPsych.timelineVariable("word"),
    left_or_right: jsPsych.timelineVariable("left_or_right"),
    sentence_type: jsPsych.timelineVariable("sentence_type"),
    question: jsPsych.timelineVariable("question"),
    correct_response: jsPsych.timelineVariable("correct_response"),
    trigger_value: jsPsych.timelineVariable("trigger_value"),
  },
  on_finish: function (data) {
    data.correct = data.response == data.correct_response;
  },
  post_trial_gap: 1000,
};

var intermission = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "The practice portion is complete. Experimenters will check to see if you are ready to proceed. Press any key to continue.",
};

var ask_to_repeat = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "Would you like to repeat the practice session? Press 'y' for yes, and 'n' for no.",
  choices: ["y", "n"],
  data: {
    task: "repeat",
  },
};

var practice_sentences_timeline = {
  timeline: [
    practice_fixation,
    practice_sentence_loop,
    practice_final_word,
    question_mark,
    practice_question,
  ],
  timeline_variables: practice_questions.slice(0, N_PRACTICE_QUESTIONS),
};

var practice_procedure = {
  timeline: [
    practice_instructions,
    practice_sentences_timeline,
    intermission,
    ask_to_repeat,
  ],
  loop_function: function (data) {
    if (data.filter({ task: "repeat" }).values()[0].response == "y") {
      return true;
    } else {
      return false;
    }
  },
};

timeline.push(practice_procedure);

var beginning_exp = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "The first set of 60 sentences will begin on the next screen. Press any key to begin.",
};

timeline.push(beginning_exp);

//initialize the joke sentence and the words
var joke = "";
var joke_words = [];
//initialize the counter
var i = 0;

var fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "+",
  choices: "NO_KEYS",
  trial_duration: 500,
  on_finish: function () {
    joke = jsPsych.timelineVariable("sentence");
    joke_words = joke.split(" ");
  },
  css_classes: ["big-font"],
};

var joke_loop = {
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function () {
        return joke_words[i];
      },
      choices: "NO_KEYS",
      trial_duration: function () {
        //from the pair
        return 200 + 32 * joke_words[i].length;
      },
      css_classes: ["big-font"],
    },
  ],

  loop_function: function () {
    i++;
    if (i < joke_words.length) {
      return true;
    } else {
      joke = "";
      joke_words = [];
      i = 0;
      return false;
    }
  },
};

var test = {
  on_load: () => {
    fetch(
      `http://127.0.0.1:8000/trigger/tcp/${jsPsych.timelineVariable(
        "trigger_value"
      )}`
    );
  },

  type: jsPsychHtmlKeyboardResponse,
  stimulus: function () {
    var leftEnding = `<div style="position:relative; width:800px; height:60px; line-height:60px">
            <p style="position:absolute; width:800px; text-align:center; margin:0;">+</p>
            <p style="position:absolute; left: calc(50% + 89px); margin:0;">${jsPsych.timelineVariable(
              "word"
            )}</p>
            </div>`;

    var rightEnding = `<div style="position:relative; width:800px; height:60px; line-height:60px;">
            <p style="position:absolute; width:800px; text-align:center; margin:0;">+</p>
            <p style="position:absolute; right:calc(50% + 89px); margin:0;">${jsPsych.timelineVariable(
              "word"
            )}</p>
            </div>`;

    if (jsPsych.timelineVariable("left_or_right") == "left") {
      return leftEnding;
    } else {
      return rightEnding;
    }
  },

  choices: "NO_KEYS",
  trial_duration: 200,
  post_trial_gap: 2500,
  css_classes: ["big-font"],
  data: {
    task: 'test-word-trigger',
    id_2: jsPsych.timelineVariable("id_2"),
    sentence: jsPsych.timelineVariable("sentence"),
    word: jsPsych.timelineVariable("word"),
    left_or_right: jsPsych.timelineVariable("left_or_right"),
    sentence_type: jsPsych.timelineVariable("sentence_type"),
    trigger_value: jsPsych.timelineVariable("trigger_value"),
  }
};

var question_mark = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<div style='color:blue; font-size:128px;'>?</div>",
  choices: "NO_KEYS",
  trial_duration: 2000,
};

var question = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("question"),
  choices: ["y", "n"],
  data: {
    task: "test-response",
    id_2: jsPsych.timelineVariable("id_2"),
    sentence: jsPsych.timelineVariable("sentence"),
    word: jsPsych.timelineVariable("word"),
    left_or_right: jsPsych.timelineVariable("left_or_right"),
    sentence_type: jsPsych.timelineVariable("sentence_type"),
    question: jsPsych.timelineVariable("question"),
    correct_response: jsPsych.timelineVariable("correct_response"),
    trigger_value: jsPsych.timelineVariable("trigger_value"),
  },
  on_finish: function (data) {
    data.correct = data.response == data.correct_response;
  },
  post_trial_gap: 1000,
};

var test_block_1 = {
  timeline: [fixation, joke_loop, test, question_mark, question],
  timeline_variables: test_stimuli[selectedNumber].slice(
    0,
    N_QUESTIONS_PER_BLOCK
  ),
};

var test_block_2 = {
  timeline: [fixation, joke_loop, test, question_mark, question],
  timeline_variables: test_stimuli[selectedNumber].slice(
    N_QUESTIONS_PER_BLOCK,
    N_QUESTIONS_PER_BLOCK * 2
  ),
};

var test_block_3 = {
  timeline: [fixation, joke_loop, test, question_mark, question],
  timeline_variables: test_stimuli[selectedNumber].slice(
    N_QUESTIONS_PER_BLOCK * 2,
    N_QUESTIONS_PER_BLOCK * 3
  ),
};

var test_block_4 = {
  timeline: [fixation, joke_loop, test, question_mark, question],
  timeline_variables: test_stimuli[selectedNumber].slice(
    N_QUESTIONS_PER_BLOCK * 3,
    N_QUESTIONS_PER_BLOCK * 4
  ),
};

var break_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<p>You have finished a set of 60 sentences.</p>
        <p>Please let the experimenter know when you are ready to continue.</p>
        <p>Then press the spacebar to begin the next set.</p>`,
  choices: [" "],
  post_trial_gap: 2000,
};

timeline.push(test_block_1);
timeline.push(break_block);
timeline.push(test_block_2);
timeline.push(break_block);
timeline.push(test_block_3);
timeline.push(break_block);
timeline.push(test_block_4);

var debrief_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<p>You have completed the experiment. Thank you!</p>
    <p>The experimenter will help you remove the cap and explain the purpose of the experiment.</p>
    <p>Experimenter: Press the spacebar to exit fullscreen mode after helping the participant leave. Then close the browser window.</p>`,
  choices: [" "],
  on_finish: function () {
    document.querySelector("html").classList.remove("hide-cursor");
  },
  on_start: function () {
    jsPsych.data
      .get()
      .localSave("json", `subject-${subject_id}-behavioral.json`);
  },
};

timeline.push(debrief_block);

var exit_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: false,
};

timeline.push(exit_fullscreen);

jsPsych.run(timeline);

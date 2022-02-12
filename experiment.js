var test_stimuli = [list_a, list_b, list_c, list_d];

var jsPsych = initJsPsych({});

var urlvar = jsPsych.data.urlVariables();
//decides which list is going to be used, either 0, 1, 2, 3.
var selectedNumber = urlvar.list;

//This is the timeline where we will add all the javascript variables
//(the trials and instrucitons and whatnot) so they can appear on the
//screen in chronological order
var timeline = []; //it is a variable and it is initialized as an empty list

// researcher input
var researchInput = {
  type: jsPsychSurveyText,
  preamble: "Please enter the participant ID as a two digit number, e.g., 01",
  questions: [{ prompt: "Participant ID: ", required: true }],
  on_finish: function (data) {
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
  stimulus: "Welcome to our EEG Experiment. Press any key to begin.",
};

timeline.push(welcome);

// practice block

var practice_instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "We will now begin the practice portion of the experiment. Press any key to begin.",
};

var practice_sentence = "";
var practice_words = [];
//initialize the counter
var i = 0;

var practice_fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "+",
  choices: "NO_KEYS",
  trial_duration: 2000,
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
    if (jsPsych.timelineVariable("Left_or_Right") == "left") {
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
  trial_duration: 1000,
  post_trial_gap: 2500,
  css_classes: ["big-font"],
};

var question_mark = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<div style='color:blue; font-size:128px;'>?</div>",
  choices: "NO_KEYS",
  trial_duration: 2000,
};

var practice_question = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("Question"),
  choices: ["y", "n"],
  data: {
    task: "response",
    correct_response: jsPsych.timelineVariable("correct_response"),
  },
  //trial_duration: 4000,
  on_finish: function (data) {
    data.correct = data.response == data.correct_response;
  },
  post_trial_gap: 2000,
};

var intermission = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Please wait for the researcher to enter the room.",
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
  timeline_variables: practice_questions,
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
  stimulus: "We will now begin the experiment. Press any key to begin.",
};

timeline.push(beginning_exp);

// STARTING EXPERIMENT
//initialize the joke sentence and the words
var joke = "";
var joke_words = [];
//initialize the counter
var i = 0;

var fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "+",
  choices: "NO_KEYS",
  trial_duration: 2000,
  on_finish: function () {
    joke = jsPsych.timelineVariable("Sentence");
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
    var left_right_choice = jsPsych.timelineVariable("left_or_right");

    var leftEnding = `<div style="position:relative; width:800px; height:60px; line-height:60px">
            <p style="position:absolute; width:800px; text-align:center; margin:0;">+</p>
            <p style="position:absolute; left: calc(50% + 89px); margin:0;">${jsPsych.timelineVariable(
              "Ending"
            )}</p>
            </div>`;

    var rightEnding = `<div style="position:relative; width:800px; height:60px; line-height:60px;">
            <p style="position:absolute; width:800px; text-align:center; margin:0;">+</p>
            <p style="position:absolute; right:calc(50% + 89px); margin:0;">${jsPsych.timelineVariable(
              "Ending"
            )}</p>
            </div>`;

    if ((left_or_right_choice = "left")) {
      return leftEnding;
    } else {
      return rightEnding;
    }
  },

  choices: "NO_KEYS",
  trial_duration: 1000,
  post_trial_gap: 2500,
  css_classes: ["big-font"],
};

var question_mark = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<div style='color:blue; font-size:128px;'>?</div>",
  choices: "NO_KEYS",
  trial_duration: 2000,
};

var question = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("Question"),
  choices: ["y", "n"],
  data: {
    task: "response",
    id: jsPsych.timelineVariable("Id"),
    sentence: jsPsych.timelineVariable("Sentence"),
    ending: jsPsych.timelineVariable("Ending"),
    left_or_right: jsPsych.timelineVariable("Left_or_Right"),
    sentence_type: jsPsych.timelineVariable("Sentence_Type"),
    question: jsPsych.timelineVariable("Question"),
    correct_response: jsPsych.timelineVariable("Correct_Response"),
  },
  //trial_duration: 4000,
  on_finish: function (data) {
    data.correct = data.response == data.correct_response;
  },
  post_trial_gap: 2000,
};

var test_procedure = {
  timeline: [fixation, joke_loop, test, question_mark, question],
  timeline_variables: test_stimuli[selectedNumber],
};
timeline.push(test_procedure);

var debrief_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function () {
    var trials = jsPsych.data.get().filter({ task: "response" });
    var correct_trials = trials.filter({ correct: true });
    var accuracy = Math.round((correct_trials.count() / trials.count()) * 100);
    //var rt = Math.round(correct_trials.select("rt").mean());

    return `<p>You responded correctly on ${accuracy}% of the trials.</p> <p>Press any key to complete the experiment. Thank you!</p>`;
  },
};

timeline.push(debrief_block);

var exit_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: false,
};

timeline.push(exit_fullscreen);

jsPsych.run(timeline);

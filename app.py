from flask import Flask, render_template, request, redirect, url_for, session
import json
import random

app = Flask(__name__)
app.secret_key = 'khmer_quiz_master_key'

def load_data():
    with open('questions.json', 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route('/')
def index():
    data = load_data()
    themes = list(data.keys())
    return render_template('index.html', themes=themes)

@app.route('/start_quiz/<theme>')
def start_quiz(theme):
    data = load_data()
    all_questions_for_theme = data.get(theme, [])
    num_to_select = min(5, len(all_questions_for_theme))
    if num_to_select > 0:
        questions = random.sample(all_questions_for_theme, num_to_select)
    else:
        questions = []
    session['questions'] = questions
    session['theme'] = theme
    session['score'] = 0
    session['current_q_index'] = 0
    return redirect(url_for('question'))

@app.route('/question')
def question():
    questions = session.get('questions', [])
    current_q_index = session.get('current_q_index', 0)
    
    if current_q_index >= len(questions):
        return redirect(url_for('result'))
        
    current_question = questions[current_q_index]
    
    correct_choice_obj = current_question
    
    all_questions_in_theme = load_data()[session['theme']]
    other_question_objs = [q for q in all_questions_in_theme if q['id'] != current_question['id']]
    
    if len(other_question_objs) < 3:
        all_objs = [q for category in load_data().values() for q in category]
        other_question_objs.extend([q for q in all_objs if q['id'] != current_question['id']])
        temp_dict = {q['id']: q for q in other_question_objs}
        other_question_objs = list(temp_dict.values())

    dummy_choice_objs = random.sample(other_question_objs, 3)
    
    choice_objects = [correct_choice_obj] + dummy_choice_objs
    random.shuffle(choice_objects)
    
    session['current_choice_objects'] = choice_objects
    
    return render_template(
        'question.html',
        question_prompt=current_question['meaning'],
        q_num=current_q_index + 1,
        total=len(questions),
        choices=choice_objects
    )

@app.route('/answer', methods=['POST'])
def answer():
    user_answer_pronunciation = request.form.get('choice') 
    questions = session.get('questions', [])
    current_q_index = session.get('current_q_index', 0)
    correct_question = questions[current_q_index]
    
    is_correct = (user_answer_pronunciation == correct_question['pronunciation'])

    if is_correct:
        session['score'] = session.get('score', 0) + 1
    
    session['current_q_index'] += 1
    
    choice_objects = session.get('current_choice_objects', [])
    
    return render_template(
        'answer_result.html',
        correct_question=correct_question,
        is_correct=is_correct,
        choice_objects=choice_objects
    )

@app.route('/result')
def result():
    score = session.get('score', 0)
    total = len(session.get('questions', []))
    return render_template('result.html', score=score, total=total)

if __name__ == '__main__':
    app.run(debug=True)
import express from 'express';
import { promises as fs } from 'fs';

const router = express.Router();

const { readFile, writeFile } = fs;

router.get('/find/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.grades.findIndex(
      (grade) => grade.id === parseInt(req.params.id)
    );
    global.logger.info(`${req.method} ${req.baseUrl} - ${req.params.id}`);
    res.send(data.grades[index]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    let newGrade = req.body;
    const data = JSON.parse(await readFile(global.fileName));

    if (
      !newGrade.student ||
      !newGrade.subject ||
      !newGrade.type ||
      newGrade.value == null
    ) {
      throw new Error('Student, subject, type and value are required!');
    }

    newGrade = {
      id: data.nextId++,
      student: newGrade.student,
      subject: newGrade.subject,
      type: newGrade.type,
      value: newGrade.value,
      timestamp: new Date(),
    };

    data.grades.push(newGrade);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    global.logger.info(`${req.method} ${req.baseUrl} - ${newGrade}`);
    res.send(newGrade);
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const updatedGrade = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    console.log(updatedGrade.id);
    const index = data.grades.findIndex(
      (grade) => grade.id === updatedGrade.id
    );

    if (index === -1) {
      throw new Error('A valid ID is required!');
    }

    if (
      updatedGrade.id == null ||
      !updatedGrade.student ||
      !updatedGrade.subject ||
      !updatedGrade.type ||
      updatedGrade.value == null
    ) {
      throw new Error('ID, student, subject, type and value are required!');
    }

    data.grades[index].student = updatedGrade.student;
    data.grades[index].subject = updatedGrade.subject;
    data.grades[index].type = updatedGrade.type;
    data.grades[index].value = updatedGrade.value;

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    global.logger.info(`${req.method} ${req.baseUrl} - ${updatedGrade}`);
    res.send(data.grades[index]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.grades = data.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    global.logger.info(`${req.method} ${req.baseUrl} - ${req.params.id}`);
    res.send('Exclusão realizada!');
  } catch (err) {
    next(err);
  }
});

router.get('/total-value', async (req, res, next) => {
  try {
    const student = req.query.student;
    const subject = req.query.subject;

    const data = JSON.parse(await readFile(global.fileName));

    const totalValue = data.grades
      .filter((grade) => {
        return grade.student == student && grade.subject === subject;
      })
      .reduce((accumulator, current) => {
        return (accumulator += current.value);
      }, 0);

    res.send(`${student}'s total ${subject} score: ${totalValue}`);
  } catch (err) {
    next(err);
  }
});

router.get('/average', async (req, res, next) => {
  try {
    const type = req.query.type;
    const subject = req.query.subject;

    const data = JSON.parse(await readFile(global.fileName));

    data.grades = data.grades.filter((grade) => {
      return grade.type == type && grade.subject === subject;
    });

    const average =
      data.grades.reduce((accumulator, current) => {
        return (accumulator += current.value);
      }, 0) / data.grades.length;

    res.send(`Average: ${average}`);
  } catch (err) {
    next(err);
  }
});

router.get('/the-bests', async (req, res, next) => {
  try {
    const type = req.query.type;
    const subject = req.query.subject;

    const data = JSON.parse(await readFile(global.fileName));

    data.grades = data.grades
      .filter((grade) => {
        return grade.type == type && grade.subject === subject;
      })
      .sort((a, b) => b.value - a.value);

    const threeBest = data.grades.slice(0, 3);

    res.send(threeBest);
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  global.logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});

export default router;

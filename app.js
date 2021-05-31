'use strict'

const {mapUser, getRandomFirstName} = require('./util')
const {mapArticle} = require('./util')

// db connection and settings
const connection = require('./config/connection')

let userCollection
let articlesCollection
let studentsCollection

run()

async function run() {
  await connection.connect()
  // await connection.get().createCollection('users')
  await connection.get().dropCollection('users')
  userCollection = connection.get().collection('users')

  // await connection.get().createCollection('articles')
  await connection.get().dropCollection('articles')
  articlesCollection = connection.get().collection('articles')

  studentsCollection = connection.get().collection('students')

  await example1()
  await example2()
  await example3()
  await example4()

  await task1()
  await task2()
  await task3()
  await task4()
  await task5()
  await task6()
  await task7()
  await task8()
  await task9()

  await connection.close()
}

// #### Users

// - Create 2 users per department (a, b, c)
async function example1() {
  try {
    const departments = ['a', 'a', 'b', 'b', 'c', 'c']
    const users = departments.map(d => ({department: d})).map(mapUser)
    try {
      const {result} = await userCollection.insertMany(users)
    } catch (err) {
      console.log(err)
    }
  } catch (err) {
    console.error(err)
  }
}

// - Delete 1 user from department (a)
async function example2() {
  try {
    const {result} = await userCollection.deleteOne({department: 'a'})
  } catch (err) {
    console.error(err)
  }
}

// - Update firstName for users from department (b)
async function example3() {
  try {
    const usersB = await userCollection.find({department: "b"}).toArray()
    const bulkWrite = usersB.map(user => ({
      updateOne: {
        filter: {_id: user._id},
        update: {$set: {firstName: getRandomFirstName()}}
      }
    }))
    const {result} = await userCollection.bulkWrite(bulkWrite)
  } catch (err) {
    console.error(err)
  }
}

// - Find all users from department (c)
async function example4() {
  try {
    const {result} = await userCollection.find({department: "c"})
  } catch (err) {
    console.error(err)
  }
}

// - Create 5 articles per each type (a, b, c)
async function task1() {
  try {
    const types = ['a', 'a', 'a', 'a', 'a', 
                  'b', 'b', 'b', 'b', 'b',
                  'c', 'c', 'c', 'c', 'c']
    const articles = types.map(t => ({type: t})).map(mapArticle)
    try {
      const {result} = await articlesCollection.insertMany(articles)
    } catch (err) {
      console.log(err)
    }
  } catch (err) {
    console.error(err)
  }
}

// - Find articles with type a, and update tag list with next value [‘tag1-a’, ‘tag2-a’, ‘tag3’]
async function task2() {
  try {
    const filter = { "type": "a" }
    const update = { $set: {"tags": ["tag1-a", "tag2-a", "tag3"]} }
    const {result} = await articlesCollection.updateMany(filter, update, {
      new: true
    })
  } catch (err) {
    console.error(err)
  }
}

// - Add tags [‘tag2’, ‘tag3’, ‘super’] to other articles except articles from type a
async function task3() {
  try {
    const filter = { type: { $in: ["b", "c"]} }
    const update = { $set: {"tags": ["tag2", "tag3", "super"]} }
    const {result} = await articlesCollection.updateMany(filter, update, {
      new: true
    })
  } catch (err) {
    console.error(err)
  }
}

// - Find all articles that contains tags [tag2, tag1-a]
async function task4() {
  try {
    const {result} = await articlesCollection.find({"tags": { $in: ["tag2, tag1-a"]}})
  } catch (err) {
    console.error(err)
  }
}

// - Pull [tag2, tag1-a] from all articles
async function task5() {
  try {
    const filter = { $pull: { tags: { $in: ["tag2", "tag1-a"] } }}
    const {result} = await articlesCollection.updateMany(
      { },
      filter,
      { multi: true }
      )
  } catch (err) {
    console.error(err)
  }
}


// ========================================================= //
async function task6() {
  try {
    const filter = {'$pull':{ 'scores':{'type': { $in: ['exam', 'quiz'] }}}}
    const {result} = await studentsCollection.updateMany(
      { },
      filter,
      {multi: true}
    )
  } catch (err) {
    console.error(err)
  }
}

// - Find all students who have the worst score for homework, sort by descent
async function task7() {
  try {
    const {result} = await studentsCollection.aggregate([
      { $sort: {"scores.score": -1 } }
    ])
  } catch (err) {
    console.error(err)
  }
}

// - Calculate the average score for homework for all students
async function task8() {
  try {
    const {result} = await studentsCollection.aggregate([
      { $group:
            { avgHomework: { $avg: "$scores.score" } }
        }
      ])
  } catch (err) {
    console.error(err)
  }
}

// - Delete all students that have homework score <= 60
async function task9() {
  try {
    const {result} = await studentsCollection.deleteMany(
      {"scores.score": {$lt: 60}}
      )
  } catch (err) {
    console.error(err)
  }
}

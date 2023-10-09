// import express from 'express';
// import { nanoid } from 'nanoid'
// let router = express.Router()

// // not recommended at all - server should be stateless
// let posts = [
//     {
//         id: nanoid(),
//         title: "abc post title",
//         text: "some post text",
//         duedate: "00-00-0000",
//         priority:"high,medium,low"
        
//     }
// ]

// // POST    /api/v1/post
// router.post('/post', (req, res, next) => {
//     console.log('this is signup!', new Date());

//     if (
//         !req.body.title
//         || !req.body.text
//         || !req.body.duedate
//         || !req.body.priority
//     ) {
//         res.status(403);
//         res.send(`required parameters missing, 
//         example request body:
//         {
//             title: "abc post title",
//             text: "some post text"
//             duedate: "00-00-0000",
//             priority:"high,medium,low"
//         } `);
//         return;
//     }

//     posts.unshift({
//         id: nanoid(),
//         title: req.body.title,
//         text: req.body.text,
//         duedate: req.body.duedate,
//         priority: req.body.priority
//     })

//     res.send('post created');
// })
// // GET     /api/v1/posts
// router.get('/posts', (req, res, next) => {
//     console.log('this is signup!', new Date());
//     res.send(posts);
// })

// // GET     /api/v1/post/:postId
// router.get('/post/:postId', (req, res, next) => {
//     console.log('this is signup!', new Date());

//     if (req.params.postId) {
//         res.status(403).send(`post id must be a valid number, no alphabet is allowed in post id`)
//     }

//     for (let i = 0; i < posts.length; i++) {
//         if (posts[i].id === req.params.postId) {
//             res.send(posts[i]);
//             return;
//         }
//     }
//     res.send('post not found with id ' + req.params.postId);
// })

// // PUT     /api/v1/post/:userId/:postId
// // {
// //     title: "updated title",
// //     text: "updated text"
// // }

// router.put('/post/:postId', (req, res, next) => {

//     if (!req.params.postId
//         || !req.body.text
//         || !req.body.title
//         || !req.body.duedate
//         || !req.body.priority) {
//         res.status(403).send(`example put body: 
//         PUT     /api/v1/post/:postId
//         {
//             title: "updated title",
//             text: "updated text"
//             duedate: "updated duedate",
//             priority: "updated priority",
//         }
//         `)
//     }

//     for (let i = 0; i < posts.length; i++) {
//         if (posts[i].id === req.params.postId) {
//             posts[i] = {
//                 text: req.body.text,
//                 title: req.body.title,
//                 duedate: req.body.duedate,
//                 priority: req.body.priority,
//             }
//             res.send('post updated with id ' + req.params.postId);
//             return;
//         }
//     }
//     res.send('post not found with id ' + req.params.postId);
// })

// // DELETE  /api/v1/post/:userId/:postId
// router.delete('/post/:postId', (req, res, next) => {

//     if (!req.params.postId) {
//         res.status(403).send(`post id must be a valid id`)
//     }

//     for (let i = 0; i < posts.length; i++) {
//         if (posts[i].id === req.params.postId) {
//             posts.splice(i, 1)
//             res.send('post deleted with id ' + req.params.postId);
//             return;
//         }
//     }
//     res.send('post not found with id ' + req.params.postId);
// })

// export default router
import express from 'express';
import { nanoid } from 'nanoid';
import {client} from './../mongdb.mjs'
const db = client.db("cruddb");
const col = db.collection("posts");
const router = express.Router();

// not recommended at all - server should be stateless
let posts = [
  {
    id: nanoid(),
    title: "abc post title",
    text: "some post text",
    duedate: "00-00-0000",
    priority: "High",
  },
];

router.use(express.json()); // Add JSON body parser middleware

// POST    /api/v1/post
router.post('/post', async (req, res, next) => {
  console.log('this is signup!', new Date());

  const { title, text, duedate, priority } = req.body;
  if (!title || !text || !duedate || !priority) {
    res.status(403);
    res.send(`required parameters missing, 
    example request body:
    {
        "title": "abc post title",
        "text": "some post text",
        "duedate": "00-00-0000",
        "priority": "High"
    } `);
    return;
  }
    // Construct a document                                                                         
  // Insert a single document, wait for promise so we can read it back
  const insertResponse = await col.insertOne({
    id: nanoid(),
    title,
    text,
    duedate,
    priority,
  });

  // posts.unshift({
  //   id: nanoid(),
  //   title,
  //   text,
  //   duedate,
  //   priority,
  // });
  console.log("insertResponse: ", insertResponse)
  res.send('post created');
});

// GET     /api/v1/posts
router.get('/posts', (req, res, next) => {
  console.log('this is signup!', new Date());
  res.send(posts);
});

// GET     /api/v1/post/:postId
router.get('/post/:postId', (req, res, next) => {
  console.log('this is signup!', new Date());

  const { postId } = req.params;
  if (!postId || !postId.match(/^[a-zA-Z0-9_-]+$/)) {
    res.status(403).send(`post id must be a valid number, no alphabet is allowed in post id`);
    return;
  }

  const post = posts.find((p) => p.id === postId);
  if (post) {
    res.send(post);
  } else {
    res.send('post not found with id ' + postId);
  }
});

// PUT     /api/v1/post/:postId
router.put('/post/:postId', (req, res, next) => {
  const { postId } = req.params;
  const { title, text, duedate, priority } = req.body;

  if (!postId || !text || !title || !duedate || !priority) {
    res.status(403).send(`example put body: 
    PUT     /api/v1/post/:postId
    {
        "title": "updated title",
        "text": "updated text",
        "duedate": "updated duedate",
        "priority": "updated priority"
    }
    `);
    return;
  }

  const postIndex = posts.findIndex((p) => p.id === postId);
  if (postIndex !== -1) {
    posts[postIndex] = {
      id: postId,
      title,
      text,
      duedate,
      priority,
    };
    res.send('post updated with id ' + postId);
  } else {
    res.send('post not found with id ' + postId);
  }
});

// DELETE  /api/v1/post/:postId
router.delete('/post/:postId', (req, res, next) => {
  const { postId } = req.params;

  if (!postId || !postId.match(/^[a-zA-Z0-9_-]+$/)) {
    res.status(403).send(`post id must be a valid id`);
    return;
  }

  const postIndex = posts.findIndex((p) => p.id === postId);
  if (postIndex !== -1) {
    posts.splice(postIndex, 1);
    res.send('post deleted with id ' + postId);
  } else {
    res.send('post not found with id ' + postId);
  }
});

export default router;
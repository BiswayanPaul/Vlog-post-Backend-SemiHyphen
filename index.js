const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(express.json());

// Define schemas using zod
const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
});

const postSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    authorId: z.number().int().positive("Invalid author ID"),
});

const updatePostSchema = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    published: z.boolean().optional(),
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Create a new user
app.post('/users', async (req, res) => {
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
    }

    const { name, email } = validation.data;

    try {
        const newUser = await prisma.user.create({
            data: { name, email },
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({ include: { posts: true } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new post
app.post('/posts', async (req, res) => {
    const validation = postSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
    }

    const { title, content, authorId } = validation.data;

    try {
        const newPost = await prisma.post.create({
            data: { title, content, authorId },
        });
        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await prisma.post.findMany({ include: { author: true } });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a post
app.put('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const validation = updatePostSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
    }

    const { title, content, published } = validation.data;

    try {
        const updatedPost = await prisma.post.update({
            where: { id: parseInt(id) },
            data: { title, content, published },
        });
        res.json(updatedPost);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a post
app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedPost = await prisma.post.delete({
            where: { id: parseInt(id) },
        });
        res.json(deletedPost);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a user
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await prisma.user.delete({
            where: { id: parseInt(id) },
        });
        res.json(deletedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

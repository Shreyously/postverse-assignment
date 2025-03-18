const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const upload = require('../utils/multer');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    const authorId = req.query.author;

    // Build query
    const query = authorId ? { author: authorId } : {};

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .populate('author', 'username email')
        .skip(skip)
        .limit(limit),
      Post.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      posts,
      totalPages,
      currentPage: page,
      totalPosts: total
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Create a new post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const postData = {
      title,
      content,
      author: req.user._id
    };
    
    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'posts',
        use_filename: true
      });
      
      postData.imageUrl = result.secure_url;
      
      // Remove local file after upload
      fs.unlinkSync(req.file.path);
    }
    
    // Create and save post
    const post = new Post(postData);
    await post.save();
    
    // Populate author details
    await post.populate('author', 'username email');
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Update a post
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    // Find post
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check post ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    const { title, content } = req.body;
    const updateData = { title, content };
    
    // Upload new image if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'posts',
        use_filename: true
      });
      
      updateData.imageUrl = result.secure_url;
      
      // Remove local file after upload
      fs.unlinkSync(req.file.path);
    }
    
    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('author', 'username email');
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find post
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check post ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    // Delete the post
    await Post.findByIdAndDelete(req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

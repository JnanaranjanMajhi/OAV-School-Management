const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { uploadAny } = require('../middleware/upload'); // Use uploadAny for mixed media types

// @route  GET /api/messages/contacts
// @desc   Get list of available contacts to message based on role
// @access Private
router.get('/contacts', protect, async (req, res, next) => {
  try {
    const role = req.user.role;
    let query = {};
    
    if (role === 'student') {
      // Students can message teachers and admins
      query = { role: { $in: ['teacher', 'admin'] } };
    } else if (role === 'teacher') {
      // Teachers can message students and admins
      query = { role: { $in: ['student', 'admin'] } };
    } else if (role === 'admin') {
      // Admins can message everyone
      query = { _id: { $ne: req.user._id } };
    }

    const contacts = await User.find(query)
      .select('name role class subject')
      .sort({ role: 1, name: 1 });
      
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (error) { next(error); }
});

// @route  GET /api/messages/conversations
// @desc   Get list of users the current user has chatted with
// @access Private
router.get('/conversations', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender']
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: {
            _id: '$user._id',
            name: '$user.name',
            role: '$user.role',
            class: '$user.class',
            subject: '$user.subject'
          },
          lastMessage: 1,
          unreadCount: 1
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    res.json({ success: true, data: conversations });
  } catch (error) { next(error); }
});

// @route  GET /api/messages/:userId
// @desc   Get chat history with a specific user
// @access Private
router.get('/:userId', protect, async (req, res, next) => {
  try {
    const partnerId = req.params.userId;
    const myId = req.user._id;

    // Mark all unread messages from this partner as read
    await Message.updateMany(
      { sender: partnerId, receiver: myId, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: partnerId },
        { sender: partnerId, receiver: myId }
      ]
    }).sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) { next(error); }
});

// @route  POST /api/messages
// @desc   Send a message to a specific user (supports media)
// @access Private
router.post('/', protect, uploadAny.single('media'), async (req, res, next) => {
  try {
    const { receiverId, content } = req.body || {};
    const hasMedia = !!req.file;
    
    if (!receiverId || (!content && !hasMedia)) {
      return res.status(400).json({ success: false, message: 'Please provide receiver and content or media' });
    }

    const messageData = {
      sender: req.user._id,
      receiver: receiverId,
      content: content || ''
    };

    if (hasMedia) {
      let folder = 'others';
      if (req.file.mimetype.startsWith('image/')) folder = 'images';
      else if (req.file.mimetype === 'application/pdf') folder = 'pdfs';
      else if (req.file.mimetype.includes('spreadsheet') || req.file.mimetype.includes('excel')) folder = 'excel';
      
      messageData.mediaUrl = `/uploads/${folder}/${req.file.filename}`;
      messageData.mediaType = req.file.mimetype;
    }

    const message = await Message.create(messageData);

    res.status(201).json({ success: true, data: message });
  } catch (error) { next(error); }
});

module.exports = router;

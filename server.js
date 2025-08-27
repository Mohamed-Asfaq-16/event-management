const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const path = require('path');
const multer = require('multer');
const { Dropbox } = require('dropbox');
const fetch = require('node-fetch');

const app = express();

/* ---------------------- Middleware ---------------------- */
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));
}

/* ---------------------- MongoDB ------------------------- */
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

/* ---------------------- Schemas ------------------------- */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  poster: { type: String, required: true },
  description: { type: String, required: true },
  registrationLink: { type: String, required: true },
  posterUrl: { type: String, required: true },     // public (raw) image URL
  dropboxPath: { type: String, required: true },   // stored so we can delete on Dropbox
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);

/* ---------------------- Auth ---------------------------- */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

/* ---------------------- Dropbox ------------------------- */
const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN || 'sl.u.AF-txwHOupelahRdctPAZSO7rlKTdWpn8NOlhkboZKELFzl5c9cVRHnQ-WgZIvUgC_erR9cBwYotguzowOafgYMfrAQWaT9_H2KesGJLCVds6DGGTqZEOe6G5yonrQOLJqZvbykELQpDjGc53P47VRzayDMxkxPZQVbHaGdsLTFihIdFHi6LY7PEpZWXU0l1xQ75WIKdiAzo4xCGY3SvKsTOixMkzET6F8eAf2cQULz9JcQ8dlj_1UaAUCFu-25fSikX_gBdvksifcnH6UqCt7UxO8suHRdL_W2JsGbj3i2pbLWKyeiQwJA4kwP62exx6SkIyCoAR2V8NKgVNJXDYvuhniHyu1u9GT5uQvOqRXI1IDb4kg3UFuA09wW5U8qWnHU_MH71pcVJ-tnaWHMwAmNrzl5KbSezgOWbXoyKKkPPkGm91-XENMR1GmMIuII4YisEUHyRoqLSDvhw8uSx5NZv4SmfANgHlx__4wn66s4kjbCkGZXR0aVAqQI8dBxCw9jVMtm6g8xIAexYfac6AUEfKnsgvemK3Hx7kSoQUOb4QIj9qQFRtPotbbc2J98F4TkkFxka7vXx_YN8GYji4-KjgYZNQVAmITVi-HvdPXeeVpakitIGgoyjDTgp04lvt5IvuwQm7RlfnrR20qSw6eeRn57Z6q_bcBtDnkLO8K0QcalulRa33HH7cvMQiG2q8g2XC6Kb0dx-AG3clmYQ-Bm2-4ALJQjT8mI-3zI51dEX-iDKN8XhTL67dpUfaE9NuUfulT0YAS4kzZ1DY_LR5x_jN6CRoONzRPbjP_g_BptcYXXP5C5wzbw3QH1swKuWCSkCCzbgJEQc350-iE4b-Xh5dMsqEBRm25BEjufaXe9-q8u3e4dp6SmWqVRReOOMOaEnUQSslhnpKj6myC0jn_Nb92sonk_SAn3eqSjUNoNGk0Ol-wrp7Ze9TD3f1rSKIgucWKgiAovWXBi1jFiXytu6ZyPF4OuOBIMHoi-cAsE3lA4ybIyGDVM2g_j6LE7kQAT7-GIjKcWeMLbY_exLBu3ISY2DH-pn2FLEH2FEf5hc0jb4bNKY1dlwjjqMmRc7cPRrZ70WQngM_JlcwajHFjtSip1YhisG8NyWtMT1PXVVtG7nTOMsSg707kBpvw92HsTYcp7IPAgTuOaoosYHhSYTQSQO2-_GMRtje0SAWut8hGjpl-0GShk9mQH_irbBHPErsT-f5fz3iAzVQt7WeM0vhGz-pkb5KBPaWVSvOTQgRYxMsSBC_RaoNCvkKPa6krux7nbprOF6wbS3unjVvYyfn5E5PM6dBNX4VW5WPb1ebvk5a_s1DvM6__dnlvrlW5xKbqUh2pID6NWUyxeHN0nsZkFzieLaPJ9oSZfv-u07aLWyJ2VnpHHpfW8Uu4vMg2W77VAL-VSTIPWQTcdE9VH3', // put this in your .env
  fetch,
});

// Create/return a shared link and convert to a dl1 image URL
async function getRawSharedLink(pathOnDropbox) {
  try {
    const created = await dbx.sharingCreateSharedLinkWithSettings({ path: pathOnDropbox });
    return toDirectImageUrl(created.result.url);
  } catch (err) {
    if (err?.error?.error?.['.tag'] === 'shared_link_already_exists') {
      const links = await dbx.sharingListSharedLinks({ path: pathOnDropbox, direct_only: true });
      const url = links.result.links[0]?.url || '';
      if (!url) throw new Error('Could not retrieve existing shared link');
      return toDirectImageUrl(url);
    }
    throw err;
  }
}

function toDirectImageUrl(url) {
  if (!url) return '';
  return url.replace('&dl=0', '&raw=1'); // ✅ use dl=1
}

/* ---------------------- Multer (memory) ----------------- */
const upload = multer({ storage: multer.memoryStorage() });

/* ---------------------- Auth Routes --------------------- */
// Register
app.post(
  '/api/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, password, role = 'user' } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword, role });
      await user.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login
app.post(
  '/api/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'secret-key',
        { expiresIn: '24h' }
      );

      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Profile
app.get('/api/profile', auth, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

/* ---------------------- Event Routes -------------------- */
// Create Event (Admin) with Dropbox upload
app.post(
  '/api/events',
  auth,
  adminAuth,
  upload.single('posterUrl'), // expects a file field named "posterUrl"
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('registrationLink').isURL().withMessage('Valid registration link is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      if (!req.file) return res.status(400).json({ message: 'Poster file is required' });

      // Unique file name in Dropbox
      const cleanName = req.file.originalname.replace(/\s+/g, '_');
      const dropboxPath = `/${Date.now()}-${cleanName}`;

      // Upload to Dropbox
      await dbx.filesUpload({
        path: dropboxPath,
        contents: req.file.buffer,
        mode: { '.tag': 'add' }, // never overwrite
      });

      // Get a raw=1 link (directly embeddable)
      const rawUrl = await getRawSharedLink(dropboxPath);

      const { title, poster, description, registrationLink } = req.body;

      const event = new Event({
        title,
        poster,
        description,
        registrationLink,
        posterUrl: rawUrl,
        dropboxPath,
        createdBy: req.user._id,
      });

      await event.save();
      res.status(201).json(event);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Server error', error: err?.message || 'Upload failed' });
    }
  }
);

// Get All Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Events by Admin
app.get('/api/admin/events', auth, adminAuth, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Event (also delete from Dropbox)
app.delete('/api/events/:id', auth, adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Attempt to delete the file from Dropbox
    try {
      if (event.dropboxPath) {
        await dbx.filesDeleteV2({ path: event.dropboxPath });
      }
    } catch (dropErr) {
      // If file is already gone or path invalid, we log and continue deleting the DB record
      console.warn('Dropbox delete warning:', dropErr?.message || dropErr);
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ---------------------- Frontend Fallback --------------- */

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});


/* ---------------------- Start Server -------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

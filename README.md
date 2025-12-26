# Stayava - Luxury Hotel Booking Platform

A modern, responsive hotel booking website built with vanilla HTML, CSS, and JavaScript, featuring an AI-powered chatbot for reservations.

## 🌟 Features

### Core Functionality
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Hotel Listings**: Beautiful showcase of luxury hotels with ratings and pricing
- **AI-Powered Chatbot**: Intelligent booking assistant powered by Google Gemini AI
- **Interactive Elements**: Smooth animations, hover effects, and transitions
- **Multi-language Support**: French and English chatbot responses

### User Interface
- **Modern Navigation**: Fixed navigation bar with login/signup buttons
- **Hero Section**: Eye-catching landing area with floating clouds animation
- **Hotel Showcase**: Grid layout displaying premium hotels
- **Experience Section**: Feature highlights with card-based layout
- **FAQ Section**: Collapsible frequently asked questions
- **Blog Integration**: Latest travel articles and tips
- **Footer**: Comprehensive site links and social media

### Technical Features
- **OOP Architecture**: Clean, maintainable JavaScript code structure
- **Environment Variables**: Secure API key management
- **Error Handling**: Robust fallback systems for API failures
- **Performance Optimized**: Lightweight, fast-loading design
- **SEO Friendly**: Semantic HTML structure

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for external fonts and icons

### Installation

1. **Clone or download the project files**
   ```bash
   # If using git
   git clone [repository-url]
   
   # Or simply download and extract the files
   ```

2. **Environment Setup** (Optional but recommended)
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your own API keys
   nano .env
   ```

3. **Open the website**
   - Simply open `index.html` in your web browser
   - Or serve through a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent

# Development Settings
NODE_ENV=development
DEBUG=true
```

### API Configuration

The application uses Google Gemini AI for the chatbot functionality. To configure:

1. **Get API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Update .env**: Replace `GEMINI_API_KEY` with your actual API key
3. **Test**: Reload the page and test the chatbot

### Development vs Production

- **Development**: Uses fallback responses if API key is missing
- **Production**: Requires valid API key for full functionality
- **Security**: API keys are never exposed in client-side code in production

## 📁 Project Structure

```
project-cc3/
├── index.html          # Main landing page
├── login.html          # User login page
├── signup.html         # User registration page
├── styles.css          # Main stylesheet
├── app.js             # Main JavaScript application
├── script.js          # Login/signup page scripts
├── desc.css           # Login/signup page styles
├── .env               # Environment variables (create this)
├── README.md          # This file
└── plan.md            # Development planning document
```

## 🎨 Customization

### Styling
- **Colors**: Modify CSS custom properties in `:root`
- **Fonts**: Change font family in `body` selector
- **Layout**: Adjust grid layouts and spacing variables
- **Animations**: Customize keyframe animations

### Content
- **Hotels**: Update hotel data in `app.js` `loadHotels()` method
- **Blog Posts**: Modify `BLOG_POSTS` array in `app.js`
- **Text Content**: Edit HTML files for static content
- **Images**: Replace gradient backgrounds with actual images

### Functionality
- **Chatbot Behavior**: Customize responses in `GeminiService.getFallbackResponse()`
- **API Integration**: Modify API calls in `GeminiService.generateResponse()`
- **User Flow**: Update navigation and routing as needed

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI Integration**: Google Gemini AI
- **Icons**: Font Awesome 6.5.0
- **Fonts**: Georgia (serif)
- **Animations**: CSS Keyframes and Transitions
- **Responsive**: CSS Grid and Flexbox

## 📱 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Considerations

- **API Keys**: Never commit API keys to version control
- **Environment Variables**: Use `.env` files for sensitive data
- **HTTPS**: Always use HTTPS in production
- **CORS**: Configure proper CORS headers for API calls

## 🚀 Deployment

### Static Hosting
- **Netlify**: Drag and drop the project folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Push to a repository and enable Pages
- **AWS S3**: Upload files to an S3 bucket with static hosting

### Environment Setup
1. Set environment variables in your hosting platform
2. Configure HTTPS
3. Set up custom domain (optional)
4. Test all functionality

## 🐛 Troubleshooting

### Common Issues

**Chatbot not responding:**
- Check API key configuration
- Verify internet connection
- Check browser console for errors

**Layout issues on mobile:**
- Clear browser cache
- Test on actual devices
- Check CSS media queries

**Performance issues:**
- Optimize images
- Minimize JavaScript
- Enable gzip compression

### Debug Mode
Set `DEBUG=true` in `.env` to enable detailed console logging.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or support:
- Check the FAQ section on the website
- Review this README
- Check the browser console for error messages

## 🔄 Updates

### Recent Changes
- ✅ Added login/signup buttons to navigation
- ✅ Moved API keys to environment variables
- ✅ Enhanced security with proper configuration checks
- ✅ Added comprehensive documentation
- ✅ Improved responsive design

### Future Enhancements
- User authentication system
- Payment integration
- Booking management
- Admin dashboard
- Multi-language support
- PWA capabilities

---

**Stayava** - Experience luxury hotel booking with AI-powered assistance.

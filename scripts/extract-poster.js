import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('home_spoken_centre_single_app_with_landing.html', 'utf8');
const match = html.match(/src="data:image\/jpeg;base64,([^"]+)"/);

if (match) {
  fs.mkdirSync('public/images', { recursive: true });
  fs.writeFileSync('public/images/poster.jpg', Buffer.from(match[1], 'base64'));
  console.log('Successfully extracted poster.jpg to public/images/poster.jpg!');
} else {
  console.log('No base64 poster found in HTML');
}

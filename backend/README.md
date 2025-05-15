composer install
php artisan key:generate
php artisan migrate
composer create-project laravel/laravel backend
cd backend
composer require laravel/fortify
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
composer require laravel/jetstream
php artisan jetstream:install inertia
npm install
npm run dev
php artisan serve
http://127.0.0.1:8000



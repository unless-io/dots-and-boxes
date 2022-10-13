Rails.application.routes.draw do
  root "pages#home"

  resources :games, only: [:create, :show, :update]
end

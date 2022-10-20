class GamesController < ApplicationController
  before_action :set_game, only: [:show, :update]

  def create
    @game = Game.new(
      player_1: SecureRandom.send(:choose, [*'a'..'z'], 8), 
      player_2: SecureRandom.send(:choose, [*'a'..'z'], 8)
    )
    if @game.save!
      redirect_to game_path(@game)
    else
      redirect_to root_path
    end
  end

  def update
    @game.update(game_params)
  end

  def show
    @current_player = cookies[params[:id]]
    if @current_player
      @other_player = (@current_player == @game.player_1 ? @game.player_2 : @game.player_1)
    end
  end

  private

  def set_game
    @game = Game.find(params[:id])
  end

  def game_params
    params.require(:game).permit(:state, :last_turn)
  end
end
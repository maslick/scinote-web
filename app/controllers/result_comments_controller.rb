class ResultCommentsController < ApplicationController
  before_action :load_vars

  before_action :check_view_permissions, only: [ :index ]
  before_action :check_add_permissions, only: [ :new, :create ]
  before_action :check_edit_permissions, only: [:edit, :update]
  before_action :check_destroy_permissions, only: [:destroy]

  def index
    @comments = @result.last_comments(@last_comment_id, @per_page)

    respond_to do |format|
      format.json {
        # 'index' partial includes header and form for adding new
        # messages. 'list' partial is used for showing more
        # comments.
        partial = "index.html.erb"
        partial = "list.html.erb" if @last_comment_id > 0
        more_url = ""
        if @comments.count > 0
          more_url = url_for(result_result_comments_path(@result,
                                                     format: :json,
                                                     from: @comments.last.id))
        end
        render :json => {
          per_page: @per_page,
          results_number: @comments.length,
          more_url: more_url,
          html: render_to_string({
            partial: partial,
            locals: {
              comments: @comments,
              more_comments_url: more_url
            }
          })
        }
      }
    end
  end

  def new
    @comment = Comment.new(
      user: current_user
    )
  end

  def create
    @comment = Comment.new(
      message: comment_params[:message],
      user: current_user)

    respond_to do |format|
      if (@comment.valid? && @result.comments << @comment)

        # Generate activity
        Activity.create(
          type_of: :add_comment_to_result,
          user: current_user,
          project: @result.my_module.experiment.project,
          my_module: @result.my_module,
          message: t(
            "activities.add_comment_to_result",
            user: current_user.full_name,
            result: @result.name
          )
        )

        format.html {
          flash[:success] = t(
            "result_comments.create.success_flash")
          redirect_to session.delete(:return_to)
        }
        format.json {
          render json: {
            html: render_to_string({
              partial: "comment.html.erb",
              locals: {
                comment: @comment
              }
            })
          },
          status: :created
        }
      else
        response.status = 400
        format.html { render :new }
        format.json {
          render json: {
            errors: @comment.errors
          }
        }
      end
    end
  end

  def edit
    @update_url =
      result_result_comment_path(@result, @comment, format: :json)
    respond_to do |format|
      format.json do
        render json: {
          html: render_to_string(
            partial: '/comments/edit.html.erb'
          )
        }
      end
    end
  end

  def update
    @comment.message = comment_params[:message]
    respond_to do |format|
      format.json do
        if @comment.save
          # Generate activity
          Activity.create(
            type_of: :edit_result_comment,
            user: current_user,
            project: @result.my_module.experiment.project,
            my_module: @result.my_module,
            message: t(
              'activities.edit_result_comment',
              user: current_user.full_name,
              result: @result.name
            )
          )
          render json: {}, status: :ok
        else
          render json: { errors: @comment.errors.to_hash(true) },
                 status: :unprocessable_entity
        end
      end
    end
  end

  def destroy
    respond_to do |format|
      format.json do
        if @comment.destroy
          # Generate activity
          Activity.create(
            type_of: :delete_result_comment,
            user: current_user,
            project: @result.my_module.experiment.project,
            my_module: @result.my_module,
            message: t(
              'activities.delete_result_comment',
              user: current_user.full_name,
              result: @result.name
            )
          )
          render json: {}, status: :ok
        else
          render json: { message: I18n.t('comments.delete_error') },
                 status: :unprocessable_entity
        end
      end
    end
  end

  private

  def load_vars
    @last_comment_id = params[:from].to_i
    @per_page = 10
    @result = Result.find_by_id(params[:result_id])
    @my_module = @result.my_module

    unless @result
      render_404
    end
  end

  def check_view_permissions
    unless can_view_result_comments(@my_module)
      render_403
    end
  end

  def check_add_permissions
    unless can_add_result_comment_in_module(@my_module)
      render_403
    end
  end

  def check_edit_permissions
    @comment = Comment.find_by_id(params[:id])
    render_403 unless @comment.present? &&
                      can_edit_result_comment_in_module(@comment)
  end

  def check_destroy_permissions
    @comment = Comment.find_by_id(params[:id])
    render_403 unless @comment.present? &&
                      can_delete_result_comment_in_module(@comment)
  end

  def comment_params
    params.require(:comment).permit(:message)
  end

end

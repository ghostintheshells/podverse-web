import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ForgotPasswordModal, LoginModal, SignUpModal } from 'podverse-ui'
import { internetConnectivityErrorMessage } from '~/lib/constants'
import { modalsForgotPasswordIsLoading, modalsForgotPasswordShow, 
  modalsForgotPasswordSetErrorResponse, modalsLoginIsLoading,
  modalsLoginShow, modalsLoginSetErrorResponse, modalsSignUpIsLoading,
  modalsSignUpShow, modalsSignUpSetErrorResponse, userSetIsLoggedIn } from '~/redux/actions'
import { login, sendResetPassword, signUp } from '~/services/auth'

type Props = {
  modals?: any
  modalsForgotPasswordIsLoading?: any
  modalsForgotPasswordSetErrorResponse?: any
  modalsForgotPasswordShow?: any
  modalsLoginIsLoading?: any
  modalsLoginSetErrorResponse?: any
  modalsLoginShow?: any
  modalsSignUpIsLoading?: any
  modalsSignUpSetErrorResponse?: any
  modalsSignUpShow?: any
  user?: any
  userSetIsLoggedIn?: any
}

type State = {}

class Auth extends Component<Props, State> {

  constructor (props) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleForgotPasswordSubmit = this.handleForgotPasswordSubmit.bind(this)
    this.handleSignUpSubmit = this.handleSignUpSubmit.bind(this)
  }

  async handleForgotPasswordSubmit (email) {
    const { modalsForgotPasswordIsLoading, modalsForgotPasswordSetErrorResponse,
      modalsForgotPasswordShow } = this.props
    modalsForgotPasswordIsLoading(true)

    try {
      await sendResetPassword(email)
      modalsForgotPasswordShow(false)
      modalsForgotPasswordSetErrorResponse(null)
    } catch (error) {
      const errorMsg = (error.response && error.response.data) || internetConnectivityErrorMessage
      modalsForgotPasswordSetErrorResponse(errorMsg)
    } finally {
      modalsForgotPasswordIsLoading(false)
    }
  }

  async handleLogin (email, password) {
    const { modalsLoginIsLoading, modalsLoginSetErrorResponse, modalsLoginShow,
      userSetIsLoggedIn } = this.props
    modalsLoginIsLoading(true)
    
    try {
      await login(email, password)
      userSetIsLoggedIn(true)
      modalsLoginShow(false)
      modalsLoginSetErrorResponse(null)
    } catch (error) {
      const errorMsg = (error.response && error.response.data) || internetConnectivityErrorMessage
      modalsLoginSetErrorResponse(errorMsg)
      userSetIsLoggedIn(false)
    } finally {
      modalsLoginIsLoading(false)
    }
  }

  async handleSignUpSubmit (email, password) {
    const { modalsSignUpIsLoading, modalsSignUpSetErrorResponse, modalsSignUpShow,
      userSetIsLoggedIn } = this.props
    modalsSignUpIsLoading(true)

    try {
      await signUp(email, password)
      userSetIsLoggedIn(true)
      modalsSignUpShow(false)
      modalsSignUpSetErrorResponse(null)
    } catch (error) {
      const errorMsg = (error.response && error.response.data) || internetConnectivityErrorMessage
      modalsSignUpSetErrorResponse(errorMsg)
      userSetIsLoggedIn(false)
    } finally {
      modalsSignUpIsLoading(false)
    }
  }

  render () {
    const { modals, modalsForgotPasswordShow, modalsLoginShow, modalsSignUpShow
      } = this.props
    const { forgotPassword, login, signUp } = modals

    return (
      <React.Fragment>
        <ForgotPasswordModal
          errorResponse={forgotPassword.errorResponse}
          handleSubmit={this.handleForgotPasswordSubmit}
          hideModal={() => modalsForgotPasswordShow(false)}
          isLoading={modals.forgotPassword && modals.forgotPassword.isLoading}
          isOpen={modals.forgotPassword && modals.forgotPassword.isOpen} />
        <LoginModal
          errorResponse={login.errorResponse}
          handleLogin={this.handleLogin}
          hideModal={() => modalsLoginShow(false)}
          isLoading={modals.login && modals.login.isLoading}
          isOpen={modals.login && modals.login.isOpen}
          showForgotPasswordModal={() => modalsForgotPasswordShow(true)}
          showSignUpModal={() => modalsSignUpShow(true)} />
        <SignUpModal
          errorResponse={signUp.errorResponse}
          handleSignUp={this.handleSignUpSubmit}
          hideModal={() => modalsSignUpShow(false)}
          isLoading={modals.signUp && modals.signUp.isLoading}
          isOpen={modals.signUp && modals.signUp.isOpen} />
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => ({
  modalsForgotPasswordIsLoading: bindActionCreators(modalsForgotPasswordIsLoading, dispatch),
  modalsForgotPasswordShow: bindActionCreators(modalsForgotPasswordShow, dispatch),
  modalsForgotPasswordSetErrorResponse: bindActionCreators(modalsForgotPasswordSetErrorResponse, dispatch),
  modalsLoginIsLoading: bindActionCreators(modalsLoginIsLoading, dispatch),
  modalsLoginShow: bindActionCreators(modalsLoginShow, dispatch),
  modalsLoginSetErrorResponse: bindActionCreators(modalsLoginSetErrorResponse, dispatch),
  modalsSignUpIsLoading: bindActionCreators(modalsSignUpIsLoading, dispatch),
  modalsSignUpShow: bindActionCreators(modalsSignUpShow, dispatch),
  modalsSignUpSetErrorResponse: bindActionCreators(modalsSignUpSetErrorResponse, dispatch),
  userSetIsLoggedIn: bindActionCreators(userSetIsLoggedIn, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Auth)
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import scriptLoader from 'react-async-script-loader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DOMAIN, PROTOCOL } from '~/config'
import { createPayPalOrder } from '~/services/paypal'

type Props = {
  client?: string
  commit?: string
  currency?: string
  env?: string
  handlePageIsLoading: any
  hideCheckoutModal?: Function
  isScriptLoaded?: boolean
  isScriptLoadSucceed?: boolean
  onCancel: Function
  onError: Function
  onSuccess: Function
  subtotal?: string
  tax?: number
  total?: number
}

type State = {
  showButton?: any
}

class PaypalButton extends React.Component<Props, State> {
  constructor (props) {
    super(props);

    this.state = {
      showButton: false,
    }

    // React and ReactDOM are needed by the paypal.Button.react component
    //@ts-ignore
    window.React = React
    //@ts-ignore
    window.ReactDOM = ReactDOM
  }

  componentDidMount () {
    const { isScriptLoaded, isScriptLoadSucceed } = this.props

    if (isScriptLoaded && isScriptLoadSucceed) {
      this.setState({ showButton: true })
    }
  }

  componentWillReceiveProps (nextProps) {
    const { isScriptLoaded, isScriptLoadSucceed } = nextProps

    const isLoadedButWasntLoadedBefore = !this.state.showButton &&
      !this.props.isScriptLoaded && isScriptLoaded

    if (isLoadedButWasntLoadedBefore && isScriptLoadSucceed) {
      this.setState({ showButton: true })
    }
  }

  render () {
    const { client, commit, currency, env, handlePageIsLoading, hideCheckoutModal,
      subtotal, tax, total } = this.props
    const { showButton } = this.state

    const payment = async (resolve, reject) => {

      try {
        // @ts-ignore
        const paymentID = await paypal.rest.payment.create(env, client, {
          intent: 'sale',
          payer: {
            payment_method: 'paypal'
          },
          transactions: [
            {
              amount: {
                total,
                currency,
                details: {
                  subtotal,
                  tax
                }
              }
            }
          ],
          application_context: {
            brand_name: 'Podverse',
            locale: 'US',
            landing_page: 'Login',
            shipping_preference: 'NO_SHIPPING'
          },
          redirect_urls: {
            cancel_url: `${PROTOCOL}://${DOMAIN}/settings#membership`,
            return_url: `${PROTOCOL}://${DOMAIN}/settings#membership`
          }
        })

        try {
          createPayPalOrder({ paymentID })
          resolve(paymentID)
        } catch (error) {
          console.log(error)
          alert('Something went wrong. Please check your internet connection.')
          reject()
        }
      } catch (error) {
        console.log(error)
        alert('Something went wrong. Please check your internet connection.')
        reject()
      }
    }
    
    
    const onAuthorize = (data, actions) => {
      handlePageIsLoading(true)

      return actions.payment.execute()
        .then(() => {
          location.href = `${PROTOCOL}://${DOMAIN}/payment/paypal-confirming?id=${data.paymentID}`
        })
        .catch(() => {
          alert('Something went wrong. Please check your internet connection.')
          handlePageIsLoading(false)
        })
    }

    const onCancel = () => {
      if (hideCheckoutModal) {
        hideCheckoutModal()
      }
    }

    const onError = (error) => {
      console.log(error)
      alert('Something went wrong. Please check your internet connection.')
    }

    return (
      <div className='paypal-button'>
        {
          showButton && 
            // @ts-ignore
            <paypal.Button.react
              client={client}
              commit={commit}
              env={env}
              onAuthorize={onAuthorize}
              onCancel={onCancel}
              onError={onError}
              payment={payment}
              style={{
                size: 'medium'
              }} />
        }
        {
          !showButton &&
            <FontAwesomeIcon icon='spinner' spin />
        }
      </div>
    )
  }
}

export default scriptLoader('https://www.paypalobjects.com/api/checkout.js')(PaypalButton);
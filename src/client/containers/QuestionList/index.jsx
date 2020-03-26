import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, CircularProgress } from '@material-ui/core'
import { Refresh } from '@material-ui/icons'
import { deepPurple } from '@material-ui/core/colors'
import { createStructuredSelector } from 'reselect'
import { useSelector, useDispatch } from 'react-redux'
import { usePromiseTracker } from 'react-promise-tracker'

import { useInjectSaga } from 'utils/injectSaga'

import Question from 'components/Question'
import {
  makeSelectError,
  makeSelectSupportedQuestions,
  makeSelectConfiguration,
} from 'containers/Configuration/selectors'
import {
  getSupportedFormQuestions,
  getConfiguration,
  updateConfiguration,
} from 'containers/Configuration/actions'
import saga from './saga'

const key = 'questionList'

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    marginBottom: '1rem',
    color: deepPurple[500],
  },
}))

const stateSelector = createStructuredSelector({
  error: makeSelectError(),
  supportedQuestions: makeSelectSupportedQuestions(),
  configuration: makeSelectConfiguration(),
})

const QuestionList = () => {
  useInjectSaga({ key, saga })

  const classes = useStyles()
  const [expanded, setExpanded] = useState(false)

  const { error, supportedQuestions, configuration } = useSelector(stateSelector)

  const dispatch = useDispatch()

  const { promiseInProgress } = usePromiseTracker()

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const handleGetSupportedFormQuestions = async () => {
    dispatch(getSupportedFormQuestions())
    dispatch(getConfiguration())
  }

  const handleToggleSwitch = (event, questionId) => {
    dispatch(updateConfiguration(questionId, event.target.checked))
  }

  /**
   * Get user data from database
   */
  useEffect(() => {
    handleGetSupportedFormQuestions()
  }, [])

  return (
    <div>
      <Button
        variant="text"
        startIcon={<Refresh />}
        onClick={handleGetSupportedFormQuestions}
        disabled={promiseInProgress}
        className={classes.refreshButton}
      >
        Refresh Question List
      </Button>

      <div className={classes.root}>
        {!supportedQuestions || !configuration || promiseInProgress ? (
          <CircularProgress />
        ) : (
          <div>
            {supportedQuestions.map(question => (
              <Question
                question={question}
                questionConfig={configuration[question.id] || false}
                expanded={expanded}
                handleChange={handleChange}
                toggleSwitch={handleToggleSwitch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionList
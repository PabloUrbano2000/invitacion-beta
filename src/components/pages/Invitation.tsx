import { useFormik } from 'formik'
import React, { useContext, useEffect } from 'react'
import * as Yup from 'yup'

import { useParams } from 'react-router'
import pianoGif from '../../assets/images/gif1_invite.gif'
import soundOn from '../../assets/images/sound_on.png'

import { FirebaseContext } from '../../firebase'
import { Family, Invitation } from '../../types'
import { namesRegex } from '../../utils/regex'
import Spinner from '../ui/Spinner'

const formatNames = ({
  mother_name,
  father_name,
  first_child_name,
  second_child_name
}: {
  mother_name: string
  father_name: string
  first_child_name: string
  second_child_name: string
}) => {
  let names = ''
  if (mother_name) names = mother_name.split(' ')[0]
  if (father_name)
    names += mother_name
      ? ', ' + father_name.split(' ')[0]
      : father_name.split(' ')[0]
  if (first_child_name) names += ', ' + first_child_name.split(' ')[0]
  if (second_child_name) names += ', ' + second_child_name.split(' ')[0]
  const lastIndex = names.lastIndexOf(',')
  if (lastIndex !== -1) {
    let namesArray = names.split('')
    namesArray[lastIndex] = ' y'
    names = namesArray.join('')
  }
  return names
}

const BackgroundLayer = ({
  type = 'full'
}: {
  type: 'full' | 'medium' | 'tiny'
}) => {
  if (type === 'tiny') {
    return (
      <div className='layer tiny-layer'>
        <div className='melody melody-top-left' />
        <div className='melody melody-bottom-right' />
      </div>
    )
  }

  if (type === 'medium') {
    return (
      <div className='layer medium-layer'>
        <div className='melody melody-top-left' />
        <div className='melody melody-bottom-right' />
        <div className='tambor' />
        <div className='mini-piano' />
      </div>
    )
  }
  return (
    <div className='layer'>
      <div className='melody-top-left' />
      <div className='melody-bottom-right' />
      <div className='tambor' />
      <div className='mini-piano' />
      <div className='guitarra' />
      <div className='pandereta' />
      <div className='triangulo' />
      <div className='maracas' />
      <div className='piano' />
      <div className='trompeta' />
      <div className='estrellita-left'></div>
      <div className='estrellita-right'></div>
    </div>
  )
}

const InvitationPage = () => {
  const { id } = useParams()
  const { firebase } = useContext(FirebaseContext)
  const [names, setNames] = React.useState('')
  const [audio, setAudio] = React.useState<HTMLAudioElement>()

  /*
   * 1: loading
   * 2: mostrar preinvitación
   * 3: mostrar invitacion
   * 4: selección
   * 5: formulario de confirmación
   * 6: formulario de negación
   * 7: mensaje final de confirmación
   * 8: mensaje final de negación
   * 9: mensaje de error
   */
  const [stepByStep, setStepByStep] = React.useState<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  >(1)

  useEffect(() => {
    if (id) {
      const checkInvitationByFamilyId = async () => {
        const familyFound = await firebase?.getDocumentById('families', id)
        if (familyFound) {
          const familyInstance = firebase?.instanceReferenceById(
            'families',
            familyFound.id
          )
          const invitationFound: Invitation | null | undefined =
            await firebase?.getOneDocument('invitations', [
              ['family', '==', familyInstance]
            ])
          if (invitationFound) {
            if (invitationFound.accepted === 1) {
              setNames(
                formatNames({
                  mother_name: invitationFound.mother_name || '',
                  father_name: invitationFound.father_name || '',
                  first_child_name: invitationFound.first_child_name || '',
                  second_child_name: invitationFound.second_child_name || ''
                })
              )
              changePage(7)
            } else {
              setNames(invitationFound.canceller || '')
              changePage(8)
            }
            return
          }
          changePage(2)
          return
        }
        changePage(9)
      }
      checkInvitationByFamilyId()
    }
  }, [])

  useEffect(() => {
    setAudio(new Audio('/music/el-sol-redondito.mp3'))
  }, [])

  const changePage = (page: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) => {
    setStepByStep(page)
  }

  return (
    <InvitationLayout currentPage={stepByStep}>
      {stepByStep === 1 && <Step1></Step1>}
      {stepByStep === 2 && (
        <Step2
          changePage={changePage}
          playAudio={() => {
            if (audio) {
              audio.loop = true
              audio?.play()
            }
          }}
        ></Step2>
      )}
      {stepByStep === 3 && <Step3 changePage={changePage}></Step3>}
      {stepByStep === 4 && <Step4 changePage={changePage}></Step4>}
      {stepByStep === 5 && (
        <Step5
          id={id || ''}
          changePage={changePage}
          updateNames={setNames}
        ></Step5>
      )}
      {stepByStep === 6 && (
        <Step6
          id={id || ''}
          changePage={changePage}
          updateNames={setNames}
        ></Step6>
      )}
      {stepByStep === 7 && <Step7 names={names}></Step7>}
      {stepByStep === 8 && <Step8 names={names}></Step8>}
      {stepByStep === 9 && <Step9></Step9>}
    </InvitationLayout>
  )
}

const InvitationLayout = ({
  children,
  currentPage
}: {
  children: React.ReactNode
  currentPage: number
}) => {
  let layerType: 'tiny' | 'medium' | 'full' = 'medium'
  if (currentPage === 1 || currentPage === 2) {
    layerType = 'tiny'
  } else if (currentPage === 3) {
    layerType = 'full'
  }

  return (
    <div
      className='flex m-auto flex-col min-h-screen'
      style={{
        backgroundColor: '#fef7f9'
      }}
    >
      <div className='invitation-container'>
        <BackgroundLayer type={layerType}></BackgroundLayer>
        <div className='invitation-content'>{children}</div>
      </div>
    </div>
  )
}

const Step1 = () => (
  <div className='flex m-auto flex-col justify-center content-center'>
    <Spinner className='lds-dual-ring-white'></Spinner>
  </div>
)

const Step2 = ({
  changePage,
  playAudio
}: {
  changePage: Function
  playAudio: () => void
}) => (
  <div>
    <div className='invitation-preview-header'>
      <p>MIS 2 AÑITOS</p>
    </div>
    <div className='invitation-preview-subheader'>
      <p>
        IAN
        <br />
        SALVADOR
      </p>
    </div>

    <p className='invitation-preview-description'>¿Estás listo?</p>

    <div className='invitation-preview-button'>
      <button
        role='button'
        onClick={() => {
          playAudio()
          changePage(3)
        }}
      >
        <img src={pianoGif} alt='piano button'></img>
      </button>
      <span>
        Activa el sonido <img src={soundOn} alt='sound on'></img> y
        <br />
        toca el piano para comenzar
      </span>
    </div>
  </div>
)

const Step3 = ({ changePage }: { changePage: Function }) => (
  <div>
    <div className='invitation-header'>
      <p>MIS 2 AÑITOS</p>
    </div>
    <div className='invitation-subheader'>
      <p>
        IAN
        <br />
        SALVADOR
      </p>
    </div>

    <p className='invitation-description'>Ven a jugar, cantar y bailar!</p>

    <h3 className='invitation-subdescription'>
      FEBRERO <div>|</div>
      <span>15</span>
      <div>|</div> 3:30 PM
    </h3>

    <p className='invitation-house-direction'>San Juan de Miraflores</p>

    <button
      className='invitation-button'
      style={{ marginTop: 60 }}
      onClick={() => changePage(4)}
    >
      Responder invitación
    </button>
  </div>
)

const FormContainer = ({
  changePage,
  children = <></>,
  disableConfirm = false,
  disableDenied = false
}: {
  children?: React.ReactNode
  disableConfirm?: boolean
  disableDenied?: boolean
  changePage: Function
}) => (
  <>
    <p className='invitation-form-title'>MIS 2 AÑITOS</p>
    <p className='invitation-form-subtitle'>IAN SALVADOR</p>
    <div className='w-full px-2'>
      <p className='invitation-form-header'>¿Vendrás a celebrar conmigo?</p>
      <div className='flex justify-center items-center'>
        <label
          htmlFor='confirm-button'
          className={`invitation-form-btn-container ${
            disableConfirm ? 'disable' : ''
          }`}
        >
          <button
            id='confirm-button'
            className={`invitation-form-btn confirm-button`}
            onClick={() => changePage(5)}
          ></button>
          <span>Si, ahí estaré!</span>
        </label>
        <label
          htmlFor='denied-button'
          className={`invitation-form-btn-container ${
            disableDenied ? 'disable' : ''
          }`}
        >
          <button
            id='denied-button'
            className='invitation-form-btn denied-button'
            onClick={() => changePage(6)}
          />
          <span>Uy, no podré ir</span>
        </label>
      </div>
    </div>
    {children}
  </>
)

const Step4 = ({ changePage }: { changePage: Function }) => (
  <div>
    <FormContainer changePage={changePage} />
  </div>
)

const Step5 = ({
  id,
  changePage,
  updateNames
}: {
  id: string
  changePage: Function
  updateNames: Function
}) => {
  const { firebase } = useContext(FirebaseContext)
  const [inProcess, setInProcess] = React.useState(false)

  // validacion y leer los datos del formulario
  const formik = useFormik({
    initialValues: {
      father_name: '',
      mother_name: '',
      first_child_name: '',
      second_child_name: ''
    },
    validationSchema: Yup.object({
      father_name: Yup.string()
        .required()
        .matches(namesRegex, 'Formato inválido'),
      mother_name: Yup.string()
        .required()
        .matches(namesRegex, 'Formato inválido'),
      first_child_name: Yup.string()
        .optional()
        .matches(namesRegex, 'Formato inválido'),
      second_child_name: Yup.string()
        .optional()
        .matches(namesRegex, 'Formato inválido')
    }).shape(
      {
        father_name: Yup.string().when(['mother_name'], ([mother_name]) => {
          if (mother_name === undefined || mother_name?.length === 0) {
            return Yup.string()
              .required('Es requerido')
              .matches(namesRegex, 'Formato inválido')
          }
          return Yup.string().optional().matches(namesRegex, 'Formato inválido')
        }),
        mother_name: Yup.string().when(['father_name'], ([father_name]) => {
          if (father_name === undefined || father_name?.length === 0) {
            return Yup.string()
              .required('Es requerido')
              .matches(namesRegex, 'Formato inválido')
          }
          return Yup.string().optional().matches(namesRegex, 'Formato inválido')
        })
      },
      [['father_name', 'mother_name']]
    ),
    onSubmit: async (values) => {
      try {
        setInProcess(true)
        const familyFound: Family | null | undefined =
          await firebase?.getDocumentById('families', id)

        if (!familyFound) {
          changePage(9)
          return
        }
        const familyInstance = firebase?.instanceReferenceById('families', id)
        const invitationFound: Invitation | null | undefined =
          await firebase?.getOneDocument('invitations', [
            ['family', '==', familyInstance]
          ])
        if (invitationFound) {
          setTimeout(() => {
            location.reload()
          }, 2000)
          changePage(9)
          return
        }

        const data = await firebase?.insertDocument('invitations', {
          family: familyInstance,
          family_name: familyFound.name,
          father_name: values.father_name,
          mother_name: values.mother_name,
          first_child_name: values.first_child_name,
          second_child_name: values.second_child_name,
          accepted: 1
        })

        if (data?.id) {
          const asistants = formatNames({
            mother_name: values.mother_name,
            father_name: values.father_name,
            first_child_name: values.first_child_name,
            second_child_name: values.second_child_name
          })
          updateNames(asistants)
          changePage(7)
        } else {
          setTimeout(() => {
            location.reload()
          }, 2000)
          changePage(9)
        }
      } catch (error) {
        changePage(9)
      } finally {
        setInProcess(false)
      }
    }
  })

  return (
    <div className='w-full'>
      <FormContainer changePage={changePage} disableDenied={true}>
        <div className='w-full mx-auto flex flex-col p-3'>
          <form
            onSubmit={formik.handleSubmit}
            className='container px-3 mx-auto md:px-5'
          >
            <p className='form-confirm-title'>¿Con quién más irás?</p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr',
                gap: 20
              }}
            >
              <div className='mb-4 w-full'>
                <input
                  id='mother_name'
                  className={`shadow appearance-none w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formik.errors.mother_name &&
                    'border-red-500 text-red-700 error-effect'
                  }`}
                  type='text'
                  placeholder='Mamá'
                  value={formik.values.mother_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={50}
                />
              </div>
              <div className='mb-4 w-full'>
                <input
                  id='father_name'
                  className={`shadow appearance-none border w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formik.errors.father_name &&
                    'border-red-500 text-red-700 error-effect'
                  }`}
                  type='text'
                  placeholder='Papá'
                  value={formik.values.father_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={50}
                />
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr',
                gap: 20
              }}
            >
              <div className='mb-4 w-full'>
                <input
                  id='first_child_name'
                  className={`shadow appearance-none w-full border normal-effect rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formik.errors.first_child_name &&
                    'border-red-500 text-red-700 error-effect'
                  }`}
                  type='text'
                  placeholder='Hijo (a)'
                  value={formik.values.first_child_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={50}
                />
              </div>

              <div className='mb-4 w-full'>
                <input
                  id='second_child_name'
                  className={`shadow appearance-none w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formik.errors.second_child_name &&
                    'border-red-500 text-red-700 error-effect'
                  }`}
                  type='text'
                  placeholder='Hijo (a)'
                  value={formik.values.second_child_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={50}
                />
              </div>
            </div>
            <input
              type={'submit'}
              disabled={inProcess || !formik.isValid}
              style={{
                marginTop: 12
              }}
              className='invitation-button'
              value='Enviar respuesta'
            />
          </form>
        </div>
      </FormContainer>
    </div>
  )
}

const Step6 = ({
  id,
  changePage,
  updateNames
}: {
  id: string
  changePage: Function
  updateNames: Function
}) => {
  const { firebase } = useContext(FirebaseContext)
  const [inProcess, setInProcess] = React.useState(false)

  // validacion y leer los datos del formulario
  const formik = useFormik({
    initialValues: {
      canceler: ''
    },
    validationSchema: Yup.object({
      canceler: Yup.string().required().matches(namesRegex, 'Formato inválido')
    }),
    onSubmit: async (values) => {
      try {
        setInProcess(true)
        const familyFound: Family | null | undefined =
          await firebase?.getDocumentById('families', id)

        if (!familyFound) {
          setTimeout(() => {
            location.reload()
          }, 2000)
          changePage(9)
          return
        }
        const familyInstance = firebase?.instanceReferenceById('families', id)
        const invitationFound: Invitation | null | undefined =
          await firebase?.getOneDocument('invitations', [
            ['family', '==', familyInstance]
          ])
        if (invitationFound) {
          setTimeout(() => {
            location.reload()
          }, 2000)
          changePage(9)
          return
        }

        const data = await firebase?.insertDocument('invitations', {
          family: familyInstance,
          family_name: familyFound.name,
          canceller: values.canceler,
          accepted: 0
        })

        if (data?.id) {
          updateNames(values.canceler.split(' ')[0])
          changePage(8)
        } else {
          setTimeout(() => {
            location.reload()
          }, 2000)
          changePage(9)
        }
      } catch (error) {
        setTimeout(() => {
          location.reload()
        }, 2000)
        changePage(9)
      } finally {
        setInProcess(false)
      }
    }
  })
  return (
    <div>
      <FormContainer changePage={changePage} disableConfirm={true}>
        <div className='w-full mx-auto flex flex-col p-3'>
          <form
            onSubmit={formik.handleSubmit}
            className='container px-3 mx-auto md:px-5'
          >
            <p className='form-denied-title'>
              ¿Seguro que no vendrás?
              <br />
              Por favor ingresa tu
              <br />
              nombre, asi podremos
              <br />
              guardar tus dulces
            </p>
            <div className='mb-4 mx-auto'>
              <input
                id='canceler'
                className={`shadow flex appearance-none mx-auto border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  formik.errors.canceler &&
                  'border-red-500 text-red-700 error-effect'
                }`}
                style={{
                  maxWidth: 150
                }}
                type='text'
                placeholder='Nombre'
                value={formik.values.canceler}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <input
              type={'submit'}
              disabled={inProcess || !formik.isValid}
              className='invitation-button'
              value='Enviar respuesta'
              style={{
                marginTop: 35.5
              }}
            />
          </form>
        </div>
      </FormContainer>
    </div>
  )
}

const Step7 = ({ names }: { names: string }) => (
  <div className='h-full flex flex-col'>
    <div className='invitation-response'>
      <p
        className='invitation-final-message'
        style={{
          marginTop: 40,
          marginBottom: 20
        }}
      >
        Gracias, ¡mis papis y yo
        <br />
        estamos listos para
        <br />
        divertirnos juntos!
      </p>
      <p
        className='invitation-final-message'
        style={{
          marginBottom: 20
        }}
      >
        Nos vemos muy pronto {names}
      </p>

      <h3 className='invitation-subdescription'>
        FEBRERO <div>|</div>
        <span>15</span>
        <div>|</div> 3:30 PM
      </h3>

      <p
        className='invitation-house-direction'
        style={{
          marginTop: 10
        }}
      >
        Jr. Jose Morales 917 - SJM
      </p>

      <p
        className='invitation-final-message'
        style={{
          marginBottom: 20
        }}
      >
        Puedes ubicar la
        <br />
        dirección en el mapa
        <br />
        aquí:{' '}
        <a
          target='_blank'
          href='https://www.google.com/maps/place/Jr.+Jose+A.+Morales+917,+Lima+15801/@-12.1588896,-76.9716376,17z/data=!4m6!3m5!1s0x9105b8598cbe5a23:0x145ff1188cabb9de!8m2!3d-12.1594979!4d-76.9696313!16s%2Fg%2F11cs6vyc7w?entry=ttu'
        >
          R2RJ+64
        </a>
      </p>
      <p
        style={{ height: 'auto', marginTop: 20 }}
        className='invitation-final-text'
      >
        IAN SALVADOR
      </p>
    </div>
  </div>
)

const Step8 = ({ names }: { names: string }) => (
  <div className='h-full flex flex-col'>
    <div className='invitation-response'>
      <p
        className='invitation-final-message'
        style={{
          marginTop: '30%',
          marginBottom: 30
        }}
      >
        ¡{names}, nos apena
        <br />
        que no puedas asistir...
      </p>
      <p
        className='invitation-final-message'
        style={{
          marginTop: 0,
          marginBottom: 'auto'
        }}
      >
        Gracias por tomarte el
        <br />
        tiempo en responder!
      </p>
      <p
        style={{ height: 'auto', marginTop: 100 }}
        className='invitation-final-text'
      >
        IAN SALVADOR
      </p>
    </div>
  </div>
)

const Step9 = () => (
  <div className='h-full flex flex-col'>
    <div className='invitation-response'>
      <p className='invitation-final-message'>
        Algo salió mal
        <br />
        inténtalo más tarde
      </p>
      <p
        style={{ height: 'auto', marginTop: 100 }}
        className='invitation-final-text'
      >
        IAN SALVADOR
      </p>
    </div>
  </div>
)

export default InvitationPage

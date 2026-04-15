# Documentación Oficial de Flow.cl

Este documento contiene la recopilación completa de la documentación para integradores de Flow.

---

## pago-ecommerce

> Fuente: https://developers.flow.cl/docs/category/pago-ecommerce

### 📄️ Flujo de integraciónA continuación, se muestra el proceso de integración con Flow, desde la creación de una orden hasta su finalización.

### 📄️ Creación de ordenAprende de inicio a fin como recibir los pagos de tus clientes.

### 📄️ Estado de ordenConsulta el estado de tus órdenes.

### 📄️ Confirmación de ordenPago de la orden

### 📄️ Finalización de ordenLa etapa de finalización de la orden ocurre luego de unos segundos tras realizar la confirmación para los medios de pagos síncronos. Flow hace un método POST mediante el browser en la url de retorno urlReturn definida por el comercio en la creación de la orden. Este llamado se diferencia con el llamado de confirmación en la cabecera que, en este caso, acepta tipo text/html, application/xhtml+xml y application/xml.

### 📄️ Reversar ordenEste servicio permite crear una orden de reembolso. Una vez que el receptor del reembolso acepte o rechace el reembolso, Flow notificará vía POST a la página del comercio identificada en urlCallback.

---

## planes-de-suscripci%C3%B3n

> Fuente: https://developers.flow.cl/docs/category/planes-de-suscripci%C3%B3n

### 📄️ Flujo de integraciónFlujo de integración para Suscripciones en Flow

### 📄️ Crear un planEn primer lugar, el comercio debe crear uno o varios planes que desee poner a disposición de sus clientes. Estos planes pueden configurarse de manera sencilla a través del portal de Flow o mediante la API, llamando al recurso /plans/create mediante un método POST. El esquema de recurso es del tipo application/x-www-form-urlencoded, que debe ser indicado en el header Content-Type.

### 📄️ Crear un clienteEs necesario crear el cliente que se suscribirá al plan. Esta acción puede realizarse tanto desde el portal de Flow como a través de la API.

### 📄️ Registrar tarjetaSe debe invocar él método /customer/register con el customerId del cliente creado. Este método responderá un endpoint y token.

### 📄️ Estado suscripciónEl formSubscribe envía un POST que recibe de respuesta el token de suscripción. Con este token se debe invocar el método /customer/getRegisterStatus para obtener el status de la suscripción y el customerId del cliente.

### 📄️ Crear una suscripciónPara crear una suscripción se debe llamar al recurso /subscription/create mediante un método POST. El esquema de recurso es del tipo application/x-www-form-urlencoded, que debe ser indicado en el header Content-Type.

### 📄️ Crear cupónPara crear un cupon se debe llamar al recurso /coupon/create mediante un método POST. El esquema de recurso es del tipo application/x-www-form-urlencoded, que debe ser indicado en el header Content-Type.

### 📄️ Obtener facturaPara obtener una factura se debe llamar al recurso /invoice/get mediante un método GET.

---

## Credenciales de prueba

> Fuente: https://developers.flow.cl/docs/credentials

- 

- Credenciales de pruebaEn esta página

### Credenciales de prueba

### Tarjetas de crédito para pruebas​
Credenciales de prueba disponible para probar tus integraciones con flow

País de integraciónTarjetaNumeroFecha de caducidadCVVChileCrédito405188560044662311/27123PerúCrédito529313808643076911/27123MéxicoCrédito529313808643076911/27123
Es posible que algunos medios de pago tengan algún paso adicional de simulación del banco, para ello usar los siguientes datos:

- Rut : 11111111-1

- Clave: 123

### Tarjetas de prueba Perú para pagos recurrentes​

### Aceptado​
Esta tarjeta de prueba permite simular la inscripción exitosa y un pago recurrente aceptado

DatoValorN° tarjeta de crédito5293138086430769Año de expiraciónCualquieraMes de expiraciónCualquieraCVV123InscripciónSí

### Rechazado​
Esta tarjeta de prueba permite simular la inscripción exitosa y un pago recurrente rechazado

DatoValorN° tarjeta de crédito4551708161768059Año de expiraciónCualquieraMes de expiraciónCualquieraCVV123InscripciónSí

---

## Primeros pasos

> Fuente: https://developers.flow.cl/docs/intro

- 

- Primeros pasosEn esta página

### Primeros pasos
Antes de interactuar con la API REST de Flow debes tener una cuenta creada y tener tus credenciales de integración, para ello debes completar el registro en flow.cl donde obtendrás tus credenciales productivas.

Para obtener tus credenciales de sandbox que te permitirán trabajar en un ambiente de pruebas controlado, debes registrarte en la url de sandbox de Flow sandbox.flow.cl.

Consejo

Te recomendamos hacer las pruebas primero en nuestro ambiente de sandbox.

Una vez completado el registro de tu cuenta o si ya tienes una en cualquiera de los dos ambientes, ve a la sección mis datos y obtén tus credenciales en la pestaña de integraciones donde podrás acceder a tu API Key y Secret key que te permitirán interactuar con nuestra api en las siguientes urls.

AmbienteurlSandboxhttps://sandbox.flow.cl/apiProducciónhttps://www.flow.cl/api

### Firmado de parámetros​
Todos los parámetros que se envíen en el body o en query params a cualquier endpoint de la API deben ser firmados con su secret key, esto lo logras agregando un parámetro "s" con el valor de la firma que se obtiene bajo el siguiente procesos

- Ordenar los parámetros de forma alfabética ascendente en base al nombre del parámetro.

- Una vez ordenados, se deben concatenar en un string los parámetros de la siguiente forma:
Nombre_del_parametro valor nombre_del_parametro valor.

Ejemplo, si sus parámetros son:

- "apiKey" = "XXXX-XXXX-XXXX"

- "currency" = "CLP"

- "amount" = 5000
El string ordenado para firmar debería ser:

"amount5000apiKeyXXXX-XXXX-XXXXcurrencyCLP"

Ejemplos de firmado de parámetros en diferentes lenguajes de programación
- PHP
- NodeJS
- Phyton$secretKey = 'my secret'$params = array('apiKey' => '1F90971E-8276-4715-97FF-2BLG5030EE3B','token' => 'AJ089FF5467367');$keys = array_keys($params);sort($keys);$toSign = '';foreach($keys as $key) {$toSign .= $key . $params[$key];};$signature = hash_hmac('sha256', $toSign , $secretKey);

const {createHmac} = require("node:crypto")const secretKey = "my secret";const params = {  apiKey: "1F90971E-8276-4715-97FF-2BLG5030EE3B",  token: "AJ089FF5467367",};const keys = Object.keys(params);keys.sort();let toSign = "";for (let i = 0; i < keys.length; i++) {  let key = keys[i];  toSign += key + params[key];}const signature = createHmac("sha256",secretKey).update(toSign).digest("hex")

import hmacimport hashlibsecret_keyparams = {'apiKey': '1F90971E-8276-4715-97FF-2BLG5030EE3B','token': 'AJ089FF5467367'}keys = list(params.keys())keys.sort()to_sign = ''for key in keys:    to_sign += key + params[key]    signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()

### Productos de integración de flow​

### 📄️ Pagos Ecommerce

### 📄️ Planes de suscripción

---

## Comercios Asociados

> Fuente: https://developers.flow.cl/docs/merchant

- 

- Comercios AsociadosEn esta página

### Comercios Asociados
Para crear un nuevo comercio asociado en Flow debe utilizar el recurso /merchant/create mediante un método POST. El esquema de recurso es del tipo application/x-www-form-urlencoded, que debe ser indicado en el header Content-Type.

apiKeyrequired

string

 apiKey del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">apiKey del comercio

idrequired

string

 Id de comercio asociado

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Id de comercio asociado

namerequired

string

 Nombre de comercio asociado

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Nombre de comercio asociado

urlrequired

string

 Url del comercio asociado

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Url del comercio asociado

srequired

string

 la firma de los parámetros efectuada con su secretKey

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">la firma de los parámetros efectuada con su secretKey

Copy

{
- "apiKey": "string",

- "id": "string",

- "name": "string",

- "url": "string",

- "s": "string"

}

### Firma de parámetros​
Ejemplos de firmado de parámetros en diferentes lenguajes de programación
- PHP
- NodeJS
- Phyton$secretKey = 'my secret'$params = array('apiKey' => '1F90971E-8276-4715-97FF-2BLG5030EE3B','token' => 'AJ089FF5467367');$keys = array_keys($params);sort($keys);$toSign = '';foreach($keys as $key) {$toSign .= $key . $params[$key];};$signature = hash_hmac('sha256', $toSign , $secretKey);

const {createHmac} = require("node:crypto")const secretKey = "my secret";const params = {  apiKey: "1F90971E-8276-4715-97FF-2BLG5030EE3B",  token: "AJ089FF5467367",};const keys = Object.keys(params);keys.sort();let toSign = "";for (let i = 0; i < keys.length; i++) {  let key = keys[i];  toSign += key + params[key];}const signature = createHmac("sha256",secretKey).update(toSign).digest("hex")

import hmacimport hashlibsecret_keyparams = {'apiKey': '1F90971E-8276-4715-97FF-2BLG5030EE3B','token': 'AJ089FF5467367'}keys = list(params.keys())keys.sort()to_sign = ''for key in keys:    to_sign += key + params[key]    signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()

El servicio retorna el objeto merchant creado.

idstring

 Id de comercio asociado

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Id de comercio asociado

namestring

 Nombre de comercio asociado

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Nombre de comercio asociado

urlstring

 Url del comercio asociado

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Url del comercio asociado

createdatestring

 Fecha de creación

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de creación

statusnumber

 Estado del comercio. Valores posibles:

0: Pendiente de aprobación

1: Aprobado

2: Rechazado

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Estado del comercio. Valores posibles:

0: Pendiente de aprobación

1: Aprobado

2: Rechazado

verifydatestring or null

 Fecha de aprobación/rechazo

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de aprobación/rechazo

Copy

{
- "id": "NEG-A",

- "name": "Negocio A",

- "url": "https://flow.cl",

- "createdate": "02-04-2020 11:52",

- "status": "0",

- "verifydate": "02-04-2020 11:52"

}

---

## Métodos de Pago

> Fuente: https://developers.flow.cl/docs/payment-methods

- 

- Métodos de Pago

### Métodos de Pago
Flow es una plataforma de pagos online donde podrás pagar y recibir pagos de forma rápida y segura mediante:

- Chile
- Perú
- MéxicoMétodo de pagoDescripción

Tarjeta de débito, crédito y prepago/Cuotas sin interés

Billeteras Digitales

Cargo automático en tarjetas bancarias

Pago mediante bancos

Pago con aplicación MACH

Botones de pago bancarios y pago en efectivo con servipag

Método de pagoDescripción

Tarjetas de crédito y débito bancarias

Pago desde tu banca móvil o en un agente bancario

Transferencias bancarias

Pago con aplicación Yape

Método de pagoDescripciónTarjetas de crédito y débito bancariasPago desde tu banca móvil o en un agente bancarioTransferencias bancarias

---

## Guía de integración BSale

> Fuente: https://developers.flow.cl/docs/plugins/bsale

- 

- Plugins
- BsaleEn esta página

### Guía de integración BSale
Si tienes una tienda desarrollada en Bsale, puedes integrar Flow como medio de pago y comenzar a recibir pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​
Para integrar a Flow en tu tienda Bsale necesitas:

- Estar registrado en Flow como vendedor.

- Poseer una cuenta en Bsale.

- Asegúrate que tu tienda se encuentre activa y visible desde internet.

### Configuración de moneda de pago​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de E-commerce, es importante que tengas correctamente configurada la moneda de pago con la contratada en la plataforma de Flow.

### Obtener datos para la configuración de la tienda Bsale​
En primer lugar, debes obtener los datos necesarios para realizar la integración. Para ello debes:

- Ingresar al portal de integraciones.

- Iniciar sesión con tus datos de acceso (email y contraseña) asociados a tu cuenta Flow.

- Ingresar tu ApiKey y SecretKey obtenidos desde la sección Integraciones > Integración por API de tu cuenta Flow.

- Haz clic en Probar integración.

- Guardar los cambios.

- Hacer click en la sección Bsale.

- Obtener los datos necesarios para configurar a Flow como medio de pago. El secret del medio de pago corresponde al Token necesario en la configuración del medio de pago en la tienda.

### Configurar la tienda Bsale​
Para integrar Flow como medio de pago en tu tienda Bsale debes:

- Ingresa a la configuración de tu tienda Bsale en una nueva pestaña.

- Haz click en el menú Tienda en Línea > Configuración > Medios de pago.

- Haz click en la línea de Flow en Editar (icono con forma de lápiz).

Para ingresar las credenciales de integración.

- En la opción "Forma de pago", selecciona Integración Flow.

- En la opción "Token de comercio", ingresa el valor obtenido desde el portal de integraciones, en específico el Secret de medio de pago.

- Selecciona la Moneda.

- Haz clic en Guardar.

Finalmente, Haz click en la opción para activar Flow. (Debe quedar en celeste el activador).

Desde ahora tendrás disponible a Flow como medio de pago en tu tienda Bsale.

---

## Plugins para e-commerce

> Fuente: https://developers.flow.cl/docs/plugins/intro

- 

- Plugins
- Introducción

### Plugins para e-commerce
Desarrollamos diferentes plugins para e-commerce, así te podrás integrar de manera segura e intuitiva con nuestra pasarela de pagos.

- Chile
- Perú
- México

### ShopifyVer más

### VTEXVer más

### JumpsellerVer más

### WoocommerceVer más

### PrestashopVer más

### MagentoVer más

### BsaleVer más

### WixVer más

### WHMCSVer más

### OpenCartVer más

### VirtueMartVer más

### TiendanubeVer más

### ShopifyVer más

### VTEXVer más

### JumpsellerVer más

### WoocommerceVer más

### PrestashopVer más

### MagentoVer más

### BsaleVer más

### ShopifyVer más

### JumpsellerVer más

### WoocommerceVer más

### PrestashopVer más

### MagentoVer más

### BsaleVer más

### WixVer más

---

## Guía de integración para Jumpseller

> Fuente: https://developers.flow.cl/docs/plugins/jumpseller

- 

- Plugins
- JumpsellerEn esta página

### Guía de integración para Jumpseller
Si tienes una página e-commerce desarrollada con Jumpseller, puedes integrar Flow mediante el plugin y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​
Para integrar a Flow en tu tienda Jumpseller necesitas:

- Estar registrado en Flow como vendedor.

- Poseer una cuenta en Jumpseller.

- Asegurate que tu tienda se encuentre activa y visible desde internet.

### Configuración de moneda de pago​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de E-commerce, es importante que tengas correctamente configurada la moneda de pago con la contratada en la plataforma de Flow.

Para verificar la configuración de la moneda:

- Ingresar a la administración de Jumpseller.

- Ir a menú Configuración > opción General > sección Configuración general.

- En Moneda verificar la configuración.

### Obtener datos para la configuración de la tienda Jumpseller​
En primer lugar debes obtener los datos necesarios para realizar la integración. Para ello debes:

- Ingresar al Portal de integraciones.

- Iniciar sesión con tus datos de acceso (correo electrónico y contraseña) asociados a tu cuenta Flow.

- Ingresar tu ApiKey y SecretKey obtenidos desde la sección Integraciones > Integración por API, de tu cuenta Flow.

- Haz clic en Probar integración.

- Guardar los cambios.

- Hacer click en la sección Jumpseller.

- Obtener los datos necesarios para configurar a Flow como medio de pago.

### Configurar la tienda Jumpseller​
Para integrar Flow como medio de pago en tu tienda Jumpseller debes:

- Ingresa a la configuración de tu tienda Jumpseller en una nueva pestaña.

- Haz click en el menú Configuración > Pagos.

- Agrega un método de pago del tipo Pasarela de pago externa.

- Ingresa un Nombre, por ejemplo Pago con tarjetas bancarias, de casas comerciales, cupones de pago y más.

- Finalmente, debes ingresar los datos entregados en el portal de integraciones para los campos Url de método de pago, Llave de medio de pago y Secret de medio de pago.

Finalmente, tendrás disponible a Flow como medio de pago en tu tienda Jumpseller.

---

## Guía de integración para Magento

> Fuente: https://developers.flow.cl/docs/plugins/magento/latest

- 

- Plugins
- Magento
- Magento 2.1En esta página

### Guía de integración para Magento
Si tienes una página e-commerce desarrollada con Magento 2.1, puedes integrar Flow mediante las extensiones y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​
Para integrar a Flow tu sitio de E-commerce basado en Magento necesitas:

- Estar registrado en Flow como vendedor.

- Obtener el ApiKey desde la sección Integraciones > Integración por API de tu cuenta Flow.

- Contar con Magento 2 o superior.

- Verificar que tu tienda esté visible desde internet.

### Configuración de moneda de pago​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de E-commerce, es importante que tengas correctamente configurada la moneda de pago con la contratada en la plataforma de Flow.

Para verificar la configuración de la moneda:

- Ingresar a la administración de Magento.

- Ir a menú Stores (Tiendas) > opción Configuration (Configuración) > expande submenú General > opción Currency setup (Configuración de moneda).

- En Currency options (Opciones de moneda) verificar la configuración.

### Descargar e instalar​
A continuación encontrarás las instrucciones para descargar e instalar Flow en tu carro de compras.

Descargar el plugin (extensión) Pasarela Flow. Con este único plugin (extensión) tu cliente podrá acceder a todos los medios de pago que tengas activados en tu cuenta Flow, sin requerir instalaciones adicionales.

### Instalar copiando los archivos directamente al FTP​
Para copiar los archivos directamente al FTP, debes descomprimir el archivo zip del paso anterior y subir las carpetas y archivos contenidos en la carpeta raíz de la instalación de Magento 2.

Luego de copiar los archivos, desde la línea de comandos, sitúate en la raíz de tu instalación y aplica el siguiente comando: php bin/magento setup:upgrade

### Actualizar extensión de Flow​
Si ya posees una versión de alguno de las extensiones de Flow instalada en tu Magento 2 y deseas actualizarla, tendrás que desactivar el plugin actual y reescribir los archivos e instalar la versión nueva.

Para instalar la nueva versión debes seguir las mismas instrucciones del paso Descargar e Instalar.

### Configuración del medio de pago Flow​
Para configurar la extensión de Flow para Magento debes dirigirte a:

- Ingresar a la administración de Magento.

- Ir a menú Stores (Tiendas) > opción Configuration (Configuración) > expande submenú Sales (Ventas) > Payment methods (Métodos de pago)

- Buscar y abrir Flow FlowPayment en la lista Payment Methods y configurar los datos de la forma de pago:

Los datos que debes configurar son:

CampoDescripciónEnabled (Activado)Selecciona Yes (Si) si quieres usar FlowNombre de pagoIngresa el nombre que se mostrará a las personas cuando paguen en tu tienda virtual (dependiendo los medios de pago disponibles en el país donde operas), por ejemplo: 
- Flow: Pagar mediante Flow a través de tarjetas, transferencias bancarias, billeteras digitales, efectivo y más.AmbienteSelecciona si utilizarás la plataforma de producción o la plataforma sandbox de Flow:
- Plataforma de producción Flow: Se encuentra disponible en flow.cl y corresponde al sitio oficial, el cual debes utilizar para recibir tus pagos. 
- Plataforma sandbox Flow: Se encuentra disponible en sandbox.flow.cl y corresponde al sitio de pruebas, donde podrás realizar pagos de test para verificar el correcto funcionamiento del plugin.Api KeyIngresa el Api Key asociado a tu cuenta de Flow: 
- Si estás utilizando la plataforma de producción: Obtén tu Api Key desde la sección Integraciones > Integración por API en flow.cl. 
- Si estás utilizando la plataforma sandbox: Obtén tu Api Key desde la sección Integraciones > Integración por API en sandbox.flow.cl.Subir logoSi deseas modificar la imagen que por defecto se mostrará cuando un cliente pague en tu tienda virtual, puedes seleccionar una nueva haciendo clic en Seleccionar archivo. Una vez que guardes los cambios, se habrá actualizado la imagen.Estado de pago exitosoSelecciona processingEstado de pago fallidoSelecciona canceledSort orderIngresa el orden de aparición del medio de pagoUrl de retornoCorresponde a la página donde volverá el cliente una vez que generó un cupón de pago. Recomendamos que dicha url sea la página principal de tu tienda.Clic en "Save config"Debes hacer clic en Save config (Guardar configuración)  para confirmar tu configuración.

### Realizar pruebas en plataforma sandbox​
Para utilizar la plataforma sandbox debes:

- Registrarte previamente en sandbox.flow.cl.

- Configurar el plugin utilizando la plataforma sandbox. Para ello debes revisar el punto anterior.

- Finalmente, podrás simular un pago mediante Webpay Plus con las siguientes tarjetas de prueba. Recuerda que el monto mínimo a pagar son $350 CLP.

- Una vez concretadas las pruebas, debes configurar el plugin utilizando la plataforma de producción. Para ello debes revisar el punto anterior.

### Pago exitoso​
Nº de tarjetas: 4051885600446623

Fecha de expiración: cualquiera

CVV: 123

En la simulación del banco debes usar:
RUT: 11.111.111-1

Clave: 123

### Pago rechazado​
Nº de tarjetas: 5186059559590568

Fecha de expiración: cualquiera

CVV: 123

En la simulación del banco debes usar:

RUT: 11.111.111-1

Clave: 123

---

## Guía de integración para Magento 1.9

> Fuente: https://developers.flow.cl/docs/plugins/magento/version-1-9

- 

- Plugins
- Magento
- Magento 1.9En esta página

### Guía de integración para Magento 1.9
Si tienes una página e-commerce desarrollada con Magento 1.9, puedes integrar Flow mediante las extensiones y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Modelo de Integración​
Toda la comunicación entre el comercio y Flow viaja firmada electrónicamente con certificados digitales. Las firmas digitales son verificadas en cada punto de comunicación, asegurando la confiabilidad entre el emisor y el receptor.

A continuación te explicamos los dos modelos de integración con Flow el indirecto y directo.

### Modo indirecto​
Con este modo de integración, antes de enviar la transacción a Webpay, Servipag o Multicaja, se presenta una página de Flow con los datos de la transacción. Además, en dicha página se muestran los medios de pago habilitados por el vendedor, permitiendo al pagador elegir el deseado.

Descripción de acciones

- El comercio, utilizando el Kit, envía a Flow una Orden de Pago firmada electrónicamente.

- Flow recibe la Orden y verifica que provenga de un comercio registrado. En este paso presenta una página para que el pagador confirme la orden y seleccione el medio de pago deseado: Webpay, Servipag o Multicaja.

- Flow deriva al pagador a la página del medio de pago (Webpay, Servipag o Multicaja) seleccionado.

- El medio de pago envía a Flow el resultado de la transacción y solicita confirmarla.

- Flow envía el resultado del pago a la página de confirmación del comercio.

- El comercio recibe la confirmación del pago. La página del comercio tiene 15 segundos para responder la recepción de la confirmación. Si su página de confirmación no responde en ese tiempo y la transacción había sido aprobada por el medio de pago, la transacción se dará por aprobada.

- Flow envía al medio de pago la confirmación de la transacción.

- Si el pago es exitoso, Flow deriva el control a la página de éxito del comercio. Además, se envía un email notificado del pago al vendedor y al pagador.

- Si el pago es rechazado, Flow despliega su página de fracaso.

- Desde la página de fracaso de Flow, si el cliente hace click en el botón (Volver al comercio) se invoca la página de fracaso del comercio.

### Modo directo​
Con este modo de integración Flow envía la transacción directo a Webpay, Servipag o Multicaja según corresponda, sin presentar una página de Flow con los datos de la transacción.

Descripción de acciones

- El comercio utilizando el Kit, envía a Flow una Orden de Pago firmada electrónicamente.

- Flow deriva al pagador a la página del medio de pago (Webpay, Servipag o Multicaja) informado desde el Kit.

- El medio de pago envía a Flow el resultado de la transacción y solicita confirmarla.

- Flow envía el resultado del pago a la página de confirmación del comercio.

- El comercio recibe la confirmación del pago. La página del comercio tiene 15 segundos para responder la recepción de la confirmación. Si su página de confirmación no responde en ese tiempo y la transacción había sido aprobada por el medio de pago, la transacción se dará por aprobada.

- Flow envía al medio de pago la confirmación de la transacción.

- Si el pago es exitoso Flow deriva el control a la página de éxito del comercio. Además, se envía un email notificado del pago al vendedor y al pagador.

- Si el pago es rechazado Flow despliega su página de fracaso.

- Desde la página de fracaso de Flow si el cliente hace clic en el botón (Volver al comercio) se invoca la página de fracaso del comercio.

### Requisitos​
Para integrar a Flow tu sitio de e-commerce basado en Magento necesitas:

- Estar registrado en Flow como vendedor

- Descargar el Certificado digital desde "Mis Datos"

- Contar con Magento 1.9 o superior

- Asegurarse que su tienda está visible desde internet

### Descargar e instalar​
Descargar Extensión Flow WebPay y Servipag

Accede al panel de administración de Magento e ingresa a System -> Magento Connect -> Magento Connect Manager. A continuación debes subir la extensión de Flow en el apartado Direct package file upload.

Al cargarse correctamente la extensión, aparecerá en la lista inferior de dicha página.

### Actualizar extensión de Flow​
Si ya posees una versión de alguno de las extensiones de Flow instalada en tu Magento y deseas actualizarla, tendrás que desinstalar la versión anterior e instalar la versión nueva.

Para desinstalar la versión anterior debes:

- Acceder al panel de administración de Magento

- Ingresar a System -> Magento Connect -> Magento Connect Manager

- Buscar la extensión de Flow en el apartado Manage Existing Extensions

- Seleccionar la opción desinstalar

- Clic en Commit Changes

Para instalar la nueva versión debes seguir las mismas instrucciones del paso Descargar e Instalar.

### Configuración del medio de pago Flow​
Para configurar la extensión de Flow para Magento debes dirigirte a System -> Configuration -> Payment Methods

Buscar y abrir Flow en la lista Payment Methods y configurar los datos de la forma de pago

Los datos que debes configurar son:

1. Título: Ingresa el nombre que se mostrará a las personas cuando paguen en tu tienda virtual. Algunos ejemplos:

- Flow Webpay: Pagar con tarjetas de crédito o débito bancarias

- Flow Servipag: Pagar con tarjetas CMR, Ripley o Cencosud

- Flow Multicaja: Pagar en efectivo en locales adheridos a Multicaja

- Flow: Pagar mediante plataforma de pagos Flow con Webpay, Servipag y Multicaja.

2. Activado: Selecciona Si si quieres usar Flow.

3. ID Comercio Flow: Ingresa el email con el que estás registrado en Flow.

4. Plataforma de Flow o Ambiente: Selecciona si usarás la Plataforma de pruebas o la Plataforma oficial de Flow.
La plataforma de producción es la plataforma oficial donde se realizarán las transacciones.
Si antes deseas hacer pruebas selecciona la Plataforma de Pruebas. Para usar la Plataforma de Pruebas deberás registrarte en el sitio de pruebas y obtener el certificado digital desde ahí. Una vez concluyas de hacer pruebas, tendrás que configurar nuevamente la extensión con el certificado digital descargado del sitio oficial.

5. Url de retorno: Sólo aplica a la extensión de Multicaja. Corresponde a la página donde volverá el cliente una vez que generó el cupón de pago. Recomendamos que dicha url sea la página principal de tu tienda virtual.

6. Tipo Integración: Aquí debes seleccionar el tipo de integración deseado.

- Ingresar directamente (Directo): Corresponde al modo directo de integración. Una vez que el cliente confirme el pago en el sitio web del comercio, se abrirá inmediatamente la pantalla de pagos de Webpay, Servipag o Multicaja, según corresponda.

- Mostrar pasarela Flow (Indirecto): Corresponde al modo indirecto de integración. Previo al pago en Webpay, Servipag o Multicaja, se mostrará una ventana de Flow donde se indican los datos de la transacción (comercio, concepto, monto, email del pagador, etc). También se mostrarán al pagador los medios de pago que tenga habilitados el vendedor (Webpay, Servipag y/o Multicaja), pudiendo elegir el que desee.

7. Medio de pago: Selecciona si deseas tener Webpay, Servipag, Multicaja o todos.

8. Llave privada Flow o Certificado: Sube el archivo del Certificado Digital descargado desde Flow.

9. Estado Orden Inicio Pago: Selecciona Pending

10. Estado Orden Exitosa: Selecciona Processed Ogone Payment

11. Estado Orden Fallida: Selecciona Canceled

12. Moneda Aceptada: Selecciona Peso Chileno

13. Logo: Sube un logo asociado al medio de pago Flow

14. Descripción: Sube una descripción asociada al medio de pago

15. Clic en Guardar configuración: Para guardar tu configuración

### Validar configuración seleccionada​
Antes de comenzar a operar mediante Flow, te recomendamos validar la siguiente configuración:

Si estás utilizando el sitio de pruebas sandbox:

- Plataforma de Flow: Debes seleccionar la opción "Plataforma de pruebas de Flow"

- ID Comercio Flow: Debes ingresar el email de la cuenta con que estás registrado en sandbox

- Llave privada Flow: Debes subir el último certificado digital descargado desde https://sandbox.flow.cl/app/web/certificado.php

Si estás utilizando el sitio de producción flow.cl:

- Plataforma de Flow: Debes seleccionar la opción "Plataforma oficial de Flow"

- ID Comercio Flow: Debes ingresar el email de la cuenta con que estás registrado en flow.cl

- Llave privada Flow: Debes utilizar el último certificado digital descargado desde http://www.flow.cl/app/web/certificado.php

Si estás utilizando el sitio de pruebas (https://sandbox.flow.cl), puedes simular un pago mediante Webpay con las siguientes tarjetas:

### Pago exitoso​
N° Tarjeta de Crédito: 4051885600446623

Año de Expiración: Cualquiera

Mes de Expiración: Cualquiera

CVV: 123

En la simulación del banco usar:

Rut: 11.111.111-1

Clave: 123

### Pago rechazado​
N° Tarjeta de Crédito: 5186059559590568

Año de Expiración: Cualquiera

Mes de Expiración: Cualquiera

CVV: 123

En la simulación del banco usar:

Rut: 11.111.111-1

Clave: 123

---

## Guía de integración de OpenCart

> Fuente: https://developers.flow.cl/docs/plugins/open-cart/latest

- 

- Plugins
- OpenCart
- OpenCart 3.0En esta página

### Guía de integración de OpenCart
Si tienes una página E-commerce desarrollada con OpenCart, puedes integrar Flow mediante las extensiones y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​
Para integrar Flow a tu sitio de E-commerce basado en OpenCart necesitas:

- Estar registrado en Flow como vendedor.

- Obtener el ApiKey y Secret Key desde la sección Integraciones > Integración por API de tu cuenta Flow.

- OpenCart versión 3.0 o superior.

- Verificar que tu tienda esté visible desde internet.

### Configurar pesos chilenos como moneda​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de E-commerce, es importante que se utilice el peso chileno como moneda. Para agregar dicha moneda debes:

- Entrar a la administración del portal.

- Ir a Sistema > Localización > Monedas.

- Hacer clic en + para insertar una nueva moneda.

En dicho formulario debes completar los campos con los siguientes valores:

- Agregar Peso Chileno como título.

- Agregar CLP como código.

- Agregar $ como símbolo a la izquierda.

- Dejar símbolo a derecha en blanco.

- Agregar 0 como decimales.

- Agregar 1.0000 como valor.

- Seleccionar el estado como activo.

- Hacer clic en Guardar.

Finalmente, para configurar el peso chileno como moneda por defecto realiza lo siguiente:

- Entrar a la administración de OpenCart.

- Ir a Sistema > Configuración.

- Seleccionar la tienda que deseas configurar y hacer clic en Editar.

En dicho formulario debes completar los campos con los siguientes valores:

- Hacer clic en el tab Local.

- Seleccionar Chile como país.

- Seleccionar la región donde funcionas.

- En Moneda seleccionar Peso Chileno como predeterminada.

- Seleccionar Si en Auto Actualización de moneda (divisas).

- Clic en Grabar.

### Descargar e instalar​
Descargar Extensión Flow Webpay: Con esta extensión Flow envía la transacción directo a Webpay, sin presentar una página de Flow con los datos de la transacción.

Descargar Extensión Flow Servipag: Con esta extensión Flow envía la transacción directo a Servipag, sin presentar una página de Flow con los datos de la transacción.

Descargar Extensión Flow Multicaja: Con esta extensión Flow envía la transacción directo a Multicaja, sin presentar una página de Flow con los datos de la transacción.

Descargar Extensión Flow Onepay: Con esta extensión Flow envía la transacción directo a Onepay, sin presentar una página de Flow con los datos de la transacción.

Descargar Extensión Pasarela Flow: Con esta extensión antes de enviar la transacción a un medio de pago, se presenta una página de Flow con los datos de la transacción. Además, en dicha página se muestran los medios de pago habilitados por el vendedor, permitiendo al pagador elegir el deseado.

### Instalar mediante instalador de extensiones de Opencart​
Para instalar la extensión desde el instalador incorporado en Opencart debes:

- Entrar a la administración de OpenCart.

- Ir a Extensiones > Instalador.

- Haz clic en Upload para ubicar y seleccionar el archivo de la extensión que deseas instalar (las extensiones instalables de Opencart incluyen ocmod.zip en su nombre de archivo).

- La instalación comenzará automáticamente una vez selecciones el archivo de instalación de la extensión.

Además debes tener permisos de escritura para los siguientes directorios:

- /admin/controller/extension/

- /admin/language/

- /admin/model/extension/

- /admin/view/image/

- /admin/view/javascript/

- /admin/view/stylesheet/

- /admin/view/template/extension/

- /catalog/controller/extension/

- /catalog/language/

- /catalog/model/extension/

- /catalog/view/javascript/

- /catalog/view/theme/

- /system/config/

- /system/library/

- /image/catalog/

### Copiar los archivos directamente al FTP​
Para copiar los archivos directamente al FTP, debes descomprimir el archivo zip y subir las carpetas y archivos contenidos en la carpeta /upload/. Dicho contenido debe ser copiado en las mismas carpetas admin y catalog de tu OpenCart.

### Actualizar extensión de Flow​
Si ya posees una versión de la extensión de Flow instalada en tu OpenCart y deseas actualizarla, debes reemplazar los archivos antiguos por los archivos actualizados. Para ello basta arrastrar las carpetas admin y catalog, obtenidas al descomprimir la nueva versión de la extensión, en las mismas carpetas de OpenCart. Es importante que todos los archivos sean reemplazados.

Luego, debes configurar la extensión tal como se muestra en el paso Configurar la extensión de Flow.

### Habilitación de la extensión OpenCart de Flow​
Para habilitar cada extensión sigue las siguientes instrucciones:

- En el menú de administración de OpenCart selecciona Extensiones > Extensiones > filtrar por Pagos.

- Podrás encontrar las extensiones Flow de los medios de pago.

- Instala las extensiones que desees utilizar, haciendo clic en Instalar.

### Configuración del medio de pago Flow​
Para cada extensión de Flow instalada, debes hacer click en Editar y configurar los siguientes campos:

Plataforma de Flow: Selecciona si utilizarás la plataforma de producción o la plataforma sandbox de Flow:

- Plataforma de producción: Se encuentra disponible en www.flow.cl y corresponde al sitio oficial, el cual debes utilizar para recibir tus pagos.

- Plataforma sandbox: Se encuentra disponible en sandbox.flow.cl y corresponde al sitio de pruebas, donde podrás realizar pagos de test para verificar el correcto funcionamiento de la extensión.

Nombre medio de pago: Ingresa el nombre que se mostrará a las personas cuando paguen en tu tienda virtual, por ejemplo:

- Flow Webpay: Pagar con tarjetas de crédito y débito bancarias.

- Flow Servipag: Pagar con bancos, tarjetas CMR, Ripley, Cencosud y sucursales Servipag.

- Flow Multicaja: Pagar en efectivo en locales Multicaja.

- Flow Onepay: Pagar con tarjetas de crédito.

- Flow: Pagar mediante Flow a través de Webpay, Servipag, Multicaja, Onepay y más.

Api Key: Ingresa el Api Key asociado a tu cuenta de Flow:

- Si estás utilizando la plataforma de producción: Obtén tu Api Key desde la sección Integraciones > Integración por API en www.flow.cl.

- Si estás utilizando la plataforma sandbox: Obtén tu Api Key desde la sección Integraciones > Integración por API en sandbox.flow.cl.

Secret Key: Ingresa el Secret Key asociado a tu cuenta de Flow:

- Si estás utilizando la plataforma de producción: Obtén tu Secret Key desde la sección Integraciones > Integración por API en www.flow.cl.

- Si estás utilizando la plataforma sandbox: Obtén tu Secret Key desde la sección Integraciones > Integración por API en sandbox.flow.cl.

Url de retorno: Sólo aplica a la extensión de Servipag, Multicaja y Pasarela Flow. Corresponde a la página donde volverá el cliente una vez que generó un cupón de pago. Recomendamos que dicha url sea la página principal de tu tienda.

Estado de pago exitoso: Selecciona Processed.

Estado de pago Fallido: Selecciona Failed.

Zona geográfica: Selecciona Todas las zonas.

Estado: Selecciona Habilitado.

Orden: Corresponde al orden en que se mostrarán los medios de pago. Puedes utilizar el valor que desees.

Clic en "Guardar": Debes hacer clic en Guardar para confirmar tu configuración.

### Realizar pruebas en plataforma sandbox​
Para utilizar la plataforma sandbox debes:

- Registrarte previamente en sandbox.flow.cl.

- Configurar la extensión utilizando la plataforma sandbox. Para ello debes revisar el punto anterior.

- Una vez concretadas las pruebas, debes configurar la extensión utilizando la plataforma de producción. Para ello debes revisar el punto anterior.

### Tarjeta de prueba para Chile​
Podrás simular un pago de Chile mediante Webpay Plus con las siguientes tarjetas de prueba. Recuerda que el monto mínimo a pagar son $350 CLP.

### Pago exitoso​
N° Tarjeta de Crédito  4051885600446623

Año de Expiración Cualquiera

Mes de Expiración Cualquiera

CVV 123

En la simulación del banco usar:

Rut 11.111.111-1

Clave 123

### Pago rechazado​
N° Tarjeta de Crédito  5186059559590568

Año de Expiración Cualquiera

Mes de Expiración Cualquiera

CVV 123

En la simulacion del banco usar:

Rut 11.111.111-1

Clave 123

### Opciones avanzadas​
A continuación se muestran opciones adicionales para personalizar la configuración de la extensión. Estas opciones requieren cierto nivel de conocimiento sobre HTML y programación.

### Agregar imagen al medio de pago​
Para agregar una imagen personalizada al medio de pago, debes seguir las siguientes instrucciones:

- Abrir los siguientes archivos:

- catalog/model/payment/flow_Webpay.php para Flow Webpay.

- catalog/model/payment/flow_servipag.php para Flow Servipag.

- catalog/model/payment/flow_multicaja.php para Flow Multicaja.

- catalog/model/payment/flow_Onepay.php para Flow Onepay.

- catalog/model/payment/flow.php para pasarela de Flow.

- Añadir el link de la imagen deseada en la línea 9:

	'title'=> '<img src="https://www.flow.cl/img/logos/webpay.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),	'title'=> '<img src="https://www.flow.cl/img/logos/servipag.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),	'title'=> '<img src="https://www.flow.cl/img/logos/multicaja.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),	'title'=> '<img src="https://www.flow.cl/img/logos/onepay.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),	'title'=> '<img src="https://www.flow.cl/img/logos/flow.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),

- El valor del atributo src permite insertar la URL de la imagen deseada, mientras que el valor del atributo width permite ajustar el ancho de la imagen.

- Finalmente, se deben guardar los cambios y revisar que la imagen se muestre correctamente.

### Tengo un error de integración​
Para conocer el error de integración debes acceder al archivo de log disponible en tu FTP. Este archivo se encuentra disponible en las siguientes carpetas:

- Webpay: storage/logs/flow_Webpay.log

- Servipag: storage/logs/flow_servipag.log

- Multicaja: storage/logs/flow_multicaja.log

- Onepay: storage/logs/flow_Onepay.log

- Pasarela Flow: storage/logs/flow_flow.log

Si no conoces como solucionar el problema de integración, puedes contactarnos al correo soporte@flow.cl, indicándonos el error, la plataforma de Flow que estás utilizando y tu Api Key.

---

## Guía de integración de OpenCart 2.2

> Fuente: https://developers.flow.cl/docs/plugins/open-cart/version-2-2

- 

- Plugins
- OpenCart
- OpenCart 2.2En esta página

### Guía de integración de OpenCart 2.2
Si tienes una página E-commerce desarrollada con OpenCart, puedes integrar Flow mediante las extensiones y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​
Para integrar Flow a tu sitio de E-commerce basado en OpenCart necesitas:

- Estar registrado en Flow como vendedor.

- Obtener el ApiKey y Secret Key desde la sección Integraciones > Integración por API de tu cuenta Flow.

- OpenCart versión 2.2 o inferior.

- Verificar que tu tienda esté visible desde internet.

### Configurar pesos chilenos como moneda​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de E-commerce, es importante que se utilice el peso chileno como moneda. Para agregar dicha moneda debes:

- Entrar a la administración del portal.

- Ir a Sistema > Localización > Monedas.

- Hacer clic en + para insertar una nueva moneda.

En dicho formulario debes completar los campos con los siguientes valores:

- Agregar Peso Chileno como título.

- Agregar CLP como código.

- Agregar $ como símbolo a la izquierda.

- Dejar símbolo a derecha en blanco.

- Agregar 0 como decimales.

- Agregar 1.0000 como valor.

- Seleccionar el estado como activo.

- Hacer clic en Guardar.

Finalmente, para configurar el peso chileno como moneda por defecto realiza lo siguiente:

- Entrar a la administración de OpenCart.

- Ir a Sistema > Configuración.

- Seleccionar la tienda que deseas configurar y hacer clic en Editar.

En dicho formulario debes completar los campos con los siguientes valores:

- Hacer clic en el tab Local.

- Seleccionar Chile como país.

- Seleccionar la región donde funcionas.

- En Moneda seleccionar Peso Chileno como predeterminada.

- Seleccionar Si en Auto Actualización de moneda (divisas).

- Clic en Grabar.

### Descargar e instalar​
Descargar Extensión Flow Webpay: Con esta extensión Flow envía la transacción directo a Webpay, sin presentar una página de Flow con los datos de la transacción.

Descargar Extensión Flow Servipag: Con esta extensión Flow envía la transacción directo a Servipag, sin presentar una página de Flow con los datos de la transacción.

Descargar Extensión Flow Multicaja: Con esta extensión Flow envía la transacción directo a Multicaja, sin presentar una página de Flow con los datos de la transacción.

Descargar Extensión Flow Onepay: Con esta extensión Flow envía la transacción directo a Onepay, sin presentar una página de Flow con los datos de la transacción.

Descargar Extensión Pasarela Flow: Con esta extensión antes de enviar la transacción a un medio de pago, se presenta una página de Flow con los datos de la transacción. Además, en dicha página se muestran los medios de pago habilitados por el vendedor, permitiendo al pagador elegir el deseado.

### Instalar mediante instalador de extensiones de Opencart​
Para instalar la extensión desde el instalador incorporado en Opencart debes:

- Entrar a la administración de OpenCart.

- Ir a Extensiones > Instalador de extensiones.

- Haz clic en Upload para ubicar y seleccionar el archivo de la extensión que deseas instalar (las extensiones instalables de Opencart incluyen ocmod.zip en su nombre de archivo).

- Haz clic en Continuar para finalizar la instalación.

Antes de utilizar el instalador de extensiones en Opencart, debes considerar tener configurado el servidor FTP, para lo cual debes:

- Entrar a la administración de OpenCart.

- Ir a Sistema > Configuración.

- Seleccionar la tienda que deseas configurar y hacer clic en Editar.

- Hacer clic en el tab FTP.

- Ingresar datos de host, puerto, usuario, contraseña, el directorio de la instalación de Opencart y activar el FTP.

- Hacer clic en Grabar.

Además debes tener permisos de escritura para los siguientes directorios:

- /admin/controller/extension/

- /admin/language/

- /admin/model/extension/

- /admin/view/image/

- /admin/view/javascript/

- /admin/view/stylesheet/

- /admin/view/template/extension/

- /catalog/controller/extension/

- /catalog/language/

- /catalog/model/extension/

- /catalog/view/javascript/

- /catalog/view/theme/

- /system/config/

- /system/library/

- /image/catalog/

### Copiar los archivos directamente al FTP​
Para copiar los archivos directamente al FTP, debes descomprimir el archivo zip y subir las carpetas y archivos contenidos en la carpeta /upload/. Dicho contenido debe ser copiado en las mismas carpetas admin y catalog de tu OpenCart.

### Actualizar extensión de Flow​
Si ya posees una versión de la extensión de Flow instalada en tu OpenCart y deseas actualizarla, debes reemplazar los archivos antiguos por los archivos actualizados. Para ello basta arrastrar las carpetas admin y catalog, obtenidas al descomprimir la nueva versión de la extensión, en las mismas carpetas de OpenCart. Es importante que todos los archivos sean reemplazados.

Luego, debes configurar la extensión tal como se muestra en el paso Configurar la extensión de Flow.

### Habilitación de la extensión OpenCart de Flow​
Para habilitar cada extensión sigue las siguientes instrucciones:

- En el menú de administración de OpenCart selecciona Extensiones > Pagos.

- Podrás encontrar las extensiones Flow de los medios de pago.

- Instala las extensiones que desees utilizar, haciendo clic en Instalar.

### Configuración del medio de pago Flow​
Para cada extensión de Flow instalada, debes hacer click en Editar y configurar los siguientes campos:

Plataforma de Flow: Selecciona si utilizarás la plataforma de producción o la plataforma sandbox de Flow:

- Plataforma de producción: Se encuentra disponible en www.flow.cl y corresponde al sitio oficial, el cual debes utilizar para recibir tus pagos.

- Plataforma sandbox: Se encuentra disponible en sandbox.flow.cl y corresponde al sitio de pruebas, donde podrás realizar pagos de test para verificar el correcto funcionamiento de la extensión.

Nombre medio de pago: Ingresa el nombre que se mostrará a las personas cuando paguen en tu tienda virtual, por ejemplo:

- Flow Webpay: Pagar con tarjetas de crédito y débito bancarias.

- Flow Servipag: Pagar con bancos, tarjetas CMR, Ripley, Cencosud y sucursales Servipag.

- Flow Multicaja: Pagar en efectivo en locales Multicaja.

- Flow Onepay: Pagar con tarjetas de crédito.

- Flow: Pagar mediante Flow a través de Webpay, Servipag, Multicaja, Onepay y más.

Api Key: Ingresa el Api Key asociado a tu cuenta de Flow:

- Si estás utilizando la plataforma de producción: Obtén tu Api Key desde la sección Integraciones > Integración por API en www.flow.cl.

- Si estás utilizando la plataforma sandbox: Obtén tu Api Key desde la sección Integraciones > Integración por API en sandbox.flow.cl.

Secret Key: Ingresa el Secret Key asociado a tu cuenta de Flow:

- Si estás utilizando la plataforma de producción: Obtén tu Secret Key desde la sección Integraciones > Integración por API en www.flow.cl.

- Si estás utilizando la plataforma sandbox: Obtén tu Secret Key desde la sección Integraciones > Integración por API en sandbox.flow.cl.

Url de retorno: Sólo aplica a la extensión de Servipag, Multicaja y Pasarela Flow. Corresponde a la página donde volverá el cliente una vez que generó un cupón de pago. Recomendamos que dicha url sea la página principal de tu tienda.

Estado de pago exitoso: Selecciona Processed.

Estado de pago Fallido: Selecciona Failed.

Zona geográfica: Selecciona Todas las zonas.

Estado: Selecciona Habilitado.

Orden: Corresponde al orden en que se mostrarán los medios de pago. Puedes utilizar el valor que desees.

Clic en "Guardar": Debes hacer clic en Guardar para confirmar tu configuración.

### Realizar pruebas en plataforma sandbox​
Para utilizar la plataforma sandbox debes:

- Registrarte previamente en sandbox.flow.cl.

- Configurar la extensión utilizando la plataforma sandbox. Para ello debes revisar el punto anterior.

- Una vez concretadas las pruebas, debes configurar la extensión utilizando la plataforma de producción. Para ello debes revisar el punto anterior.

### Tarjeta de prueba para Chile​
Podrás simular un pago de Chile mediante Webpay Plus con las siguientes tarjetas de prueba. Recuerda que el monto mínimo a pagar son $350 CLP.

### Pago exitoso​
Nº de tarjetas: 4051885600446623

Fecha de expiración: cualquiera

CVV: 123

En la simulación del banco debes usar:

RUT: 11.111.111-1

Clave: 123

### Pago rechazado​
Nº de tarjetas: 5186059559590568

Fecha de expiración: cualquiera

CVV: 123

En la simulación del banco debes usar:

RUT: 11.111.111-1

Clave: 123

### Opciones avanzadas​
A continuación se muestran opciones adicionales para personalizar la configuración de la extensión. Estas opciones requieren cierto nivel de conocimiento sobre HTML y programación.

### Agregar imagen al medio de pago​
Para agregar una imagen personalizada al medio de pago, debes seguir las siguientes instrucciones:

- Abrir los siguientes archivos:

- catalog/model/payment/flow_Webpay.php para Flow Webpay.

- catalog/model/payment/flow_servipag.php para Flow Servipag.

- catalog/model/payment/flow_multicaja.php para Flow Multicaja.

- catalog/model/payment/flow_Onepay.php para Flow Onepay.

- catalog/model/payment/flow.php para pasarela de Flow.

- Añadir el link de la imagen deseada en la línea 9:

	'title'=> '<img src="https://www.flow.cl/img/logos/webpay.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),	'title'=> '<img src="https://www.flow.cl/img/logos/servipag.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),	'title'=> '<img src="https://www.flow.cl/img/logos/multicaja.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),	'title'=> '<img src="https://www.flow.cl/img/logos/onepay.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),	'title'=> '<img src="https://www.flow.cl/img/logos/flow.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),

- El valor del atributo src permite insertar la URL de la imagen deseada, mientras que el valor del atributo width permite ajustar el ancho de la imagen.

- Finalmente, se deben guardar los cambios y revisar que la imagen se muestre correctamente.

### Tengo un error de integración​
Para conocer el error de integración debes acceder al archivo de log disponible en tu FTP. Este archivo se encuentra disponible en las siguientes carpetas:

- Webpay: system/storage/logs/flow_Webpay.log

- Servipag: system/storage/logs/flow_servipag.log

- Multicaja: system/storage/logs/flow_multicaja.log

- Onepay: system/storage/logs/flow_Onepay.log

- Pasarela Flow: system/storage/logs/flow_flow.log

Si no conoces como solucionar el problema de integración, puedes contactarnos al correo soporte@flow.cl, indicándonos el error, la plataforma de Flow que estás utilizando y tu Api Key.

---

## Guía de integración de OpenCart 2.3

> Fuente: https://developers.flow.cl/docs/plugins/open-cart/version-2-3

- 

- Plugins
- OpenCart
- OpenCart 2.3En esta página

### Guía de integración de OpenCart 2.3
Si tienes una página E-commerce desarrollada con OpenCart, puedes integrar Flow mediante las extensiones y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​
Para integrar Flow a tu sitio de E-commerce basado en OpenCart necesitas:

- Estar registrado en Flow como vendedor.

- Obtener el ApiKey y Secret Key desde la sección Integraciones > Integración por API de tu cuenta Flow.

- OpenCart versión 2.3.

- Verificar que tu tienda esté visible desde internet.

### Configurar pesos chilenos como moneda​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de E-commerce, es importante que se utilice el peso chileno como moneda. Para agregar dicha moneda debes:

- Entrar a la administración del portal.

- Ir a Sistema > Localización > Monedas.

- Hacer clic en + para insertar una nueva moneda.

En dicho formulario debes completar los campos con los siguientes valores:

- Agregar Peso Chileno como título.

- Agregar CLP como código.

- Agregar $ como símbolo a la izquierda.

- Dejar símbolo a derecha en blanco.

- Agregar 0 como decimales.

- Agregar 1.0000 como valor.

- Seleccionar el estado como activo.

- Hacer clic en Guardar.

Finalmente, para configurar el peso chileno como moneda por defecto realiza lo siguiente:

- Entrar a la administración de OpenCart.

- Ir a Sistema > Configuración.

- Seleccionar la tienda que deseas configurar y hacer clic en Editar.

En dicho formulario debes completar los campos con los siguientes valores:

- Hacer clic en el tab Local.

- Seleccionar Chile como país.

- Seleccionar la región donde funcionas.

- En Moneda seleccionar Peso Chileno como predeterminada.

- Seleccionar Si en Auto Actualización de moneda (divisas).

- Clic en Grabar.

### Descargar e instalar​
Descargar Extensión Flow Webpay: Con esta extensión Flow envía la transacción directo a Webpay, sin presentar una página de Flow con los datos de la transacción.

Descargar Extensión Flow Servipag: Con esta extensión Flow envía la transacción directo a Servipag, sin presentar una página de Flow con los datos de la transacción.

Descargar Extensión Flow Multicaja: Con esta extensión Flow envía la transacción directo a Multicaja, sin presentar una página de Flow con los datos de la transacción.

Descargar Extensión Flow Onepay: Con esta extensión Flow envía la transacción directo a Onepay, sin presentar una página de Flow con los datos de la transacción.

Descarga Extensión Pasarela Flow: Con esta extensión antes de enviar la transacción a un medio de pago, se presenta una página de Flow con los datos de la transacción. Además, en dicha página se muestran los medios de pago habilitados por el vendedor, permitiendo al pagador elegir el deseado.

### Instalar mediante instalador de extensiones de Opencart​
Para instalar la extensión desde el instalador incorporado en Opencart debes:

- Entrar a la administración de OpenCart.

- Ir a Extensiones > Instalador de extensiones.

- Haz clic en Upload para ubicar y seleccionar el archivo de la extensión que deseas instalar (las extensiones instalables de Opencart incluyen ocmod.zip en su nombre de archivo).

- Haz clic en Continuar para finalizar la instalación.

Antes de utilizar el instalador de extensiones en Opencart, debes considerar tener configurado el servidor FTP, para lo cual debes:

- Entrar a la administración de OpenCart.

- Ir a Sistema > Configuración.

- Seleccionar la tienda que deseas configurar y hacer clic en Editar.

- Hacer clic en el tab FTP.

- Ingresar datos de host, puerto, usuario, contraseña, el directorio de la instalación de Opencart y activar el FTP.

- Hacer clic en Grabar.

Además debes tener permisos de escritura para los siguientes directorios:

- /admin/controller/extension/

- /admin/language/

- /admin/model/extension/

- /admin/view/image/

- /admin/view/javascript/

- /admin/view/stylesheet/

- /admin/view/template/extension/

- /catalog/controller/extension/

- /catalog/language/

- /catalog/model/extension/

- /catalog/view/javascript/

- /catalog/view/theme/

- /system/config/

- /system/library/

- /image/catalog/

### Copiar los archivos directamente al FTP​
Para copiar los archivos directamente al FTP, debes descomprimir el archivo zip y subir las carpetas y archivos contenidos en la carpeta /upload/. Dicho contenido debe ser copiado en las mismas carpetas admin y catalog de tu OpenCart.

### Actualizar extensión de Flow​
Si ya posees una versión de la extensión de Flow instalada en tu OpenCart y deseas actualizarla, debes reemplazar los archivos antiguos por los archivos actualizados. Para ello basta arrastrar las carpetas admin y catalog, obtenidas al descomprimir la nueva versión de la extensión, en las mismas carpetas de OpenCart. Es importante que todos los archivos sean reemplazados.

Luego, debes configurar la extensión tal como se muestra en el paso Configurar la extensión de Flow.

### Habilitación de la extensión OpenCart de Flow​
Para habilitar cada extensión sigue las siguientes instrucciones:

- En el menú de administración de OpenCart selecciona Extensiones > Extensiones > filtrar por Pagos.

- Podrás encontrar las extensiones Flow de los medios de pago.

- Instala las extensiones que desees utilizar, haciendo clic en Instalar.

### Configuración del medio de pago Flow​
Para cada extensión de Flow instalada, debes hacer click en Editar y configurar los siguientes campos:

Plataforma de Flow: Selecciona si utilizarás la plataforma de producción o la plataforma sandbox de Flow:

- Plataforma de producción: Se encuentra disponible www.flow.cl y corresponde al sitio oficial, el cual debes utilizar para recibir tus pagos.

- Plataforma sandbox: Se encuentra disponible en sandbox.flow.cl y corresponde al sitio de pruebas, donde podrás realizar pagos de test para verificar el correcto funcionamiento de la extensión.

Nombre medio de pago: Ingresa el nombre que se mostrará a las personas cuando paguen en tu tienda virtual, por ejemplo:

- Flow Webpay: Pagar con tarjetas de crédito y débito bancarias.

- Flow Servipag: Pagar con bancos, tarjetas CMR, Ripley, Cencosud y sucursales Servipag.

- Flow Multicaja: Pagar en efectivo en locales Multicaja.

- Flow Onepay: Pagar con tarjetas de crédito.

- Flow: Pagar mediante Flow a través de Webpay, Servipag, Multicaja, Onepay y más.

Api Key:Ingresa el Api Key asociado a tu cuenta de Flow:

- Si estás utilizando la plataforma de producción: Obtén tu Api Key desde la sección Integraciones > Integración por API en www.flow.cl.

- Si estás utilizando la plataforma sandbox: Obtén tu Api Key desde la sección Integraciones > Integración por API en sandbox.flow.cl.

Secret Key: Ingresa el Secret Key asociado a tu cuenta de Flow:

- Si estás utilizando la plataforma de producción: Obtén tu Secret Key desde la sección Integraciones > Integración por API en www.flow.cl.

- Si estás utilizando la plataforma sandbox: Obtén tu Secret Key desde la sección Integraciones > Integración por API en sandbox.flow.cl.

Url de retorno: Sólo aplica a la extensión de Servipag, Multicaja y Pasarela Flow. Corresponde a la página donde volverá el cliente una vez que generó un cupón de pago. Recomendamos que dicha url sea la página principal de tu tienda.

Estado de pago exitoso: Selecciona Processed.

Estado de pago Fallido: Selecciona Failed.

Zona geográfica: Selecciona Todas las zonas.

Estado: Selecciona Habilitado.

Orden: Corresponde al orden en que se mostrarán los medios de pago. Puedes utilizar el valor que desees.

Clic en "Guardar": Debes hacer clic en Guardar para confirmar tu configuración.

### Realizar pruebas en plataforma sandbox​
Para utilizar la plataforma sandbox debes:

- Registrarte previamente en sandbox.flow.cl.

- Configurar la extensión utilizando la plataforma sandbox. Para ello debes revisar el punto anterior.

- Una vez concretadas las pruebas, debes configurar la extensión utilizando la plataforma de producción. Para ello debes revisar el punto anterior.

### Tarjeta de prueba para Chile​
Podrás simular un pago de Chile mediante Webpay Plus con las siguientes tarjetas de prueba. Recuerda que el monto mínimo a pagar son $350 CLP.

### Pago exitoso​
Nº de tarjetas: 4051885600446623

Fecha de expiración: cualquiera

CVV: 123

En la simulación del banco debes usar:

RUT: 11.111.111-1

Clave: 123

### Pago rechazado​
Nº de tarjetas: 5186059559590568

Fecha de expiración: cualquiera

CVV: 123

En la simulación del banco debes usar:

RUT: 11.111.111-1

Clave: 123

### Opciones avanzadas​
A continuación se muestran opciones adicionales para personalizar la configuración de la extensión. Estas opciones requieren cierto nivel de conocimiento sobre HTML y programación.

### Agregar imagen al medio de pago​
Para agregar una imagen personalizada al medio de pago, debes seguir las siguientes instrucciones:

- Abrir los siguientes archivos:

- catalog/model/payment/flow_Webpay.php para Flow Webpay.

- catalog/model/payment/flow_servipag.php para Flow Servipag.

- catalog/model/payment/flow_multicaja.php para Flow Multicaja.

- catalog/model/payment/flow_Onepay.php para Flow Onepay.

- catalog/model/payment/flow.php para pasarela de Flow.

- Añadir el link de la imagen deseada en la línea 9:

	'title'=> '<img src="https://www.flow.cl/img/logos/webpay.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),	'title'=> '<img src="https://www.flow.cl/img/logos/servipag.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),	'title'=> '<img src="https://www.flow.cl/img/logos/multicaja.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),	'title'=> '<img src="https://www.flow.cl/img/logos/onepay.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),	'title'=> '<img src="https://www.flow.cl/img/logos/flow.png" style="vertical-align:middle; width: 100px;" /> '.$this->language->get('text_title'),

- El valor del atributo src permite insertar la URL de la imagen deseada, mientras que el valor del atributo width permite ajustar el ancho de la imagen.

- Finalmente, se deben guardar los cambios y revisar que la imagen se muestre correctamente.

### Tengo un error de integración​
Para conocer el error de integración debes acceder al archivo de log disponible en tu FTP. Este archivo se encuentra disponible en las siguientes carpetas:

- Webpay: system/storage/logs/flow_Webpay.log

- Servipag: system/storage/logs/flow_servipag.log

- Multicaja: system/storage/logs/flow_multicaja.log

- Onepay: system/storage/logs/flow_Onepay.log

- Pasarela Flow: system/storage/logs/flow_flow.log

Si no conoces como solucionar el problema de integración, puedes contactarnos al correo soporte@flow.cl, indicándonos el error, la plataforma de Flow que estás utilizando y tu Api Key.

---

## Guía de integración para PrestaShop

> Fuente: https://developers.flow.cl/docs/plugins/prestashop/latest

- 

- Plugins
- PrestaShop
- Prestashop 1.7En esta página

### Guía de integración para PrestaShop
Si tienes una página e-commerce desarrollada con Prestashop 1.7, puedes integrar Flow mediante los módulos y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​
Para integrar Flow a tu sitio de E-commerce basado en Prestashop necesitas:

- Estar registrado en Flow como vendedor.

- Obtener el ApiKey y Secret Key desde la sección Integraciones > Integración por API de tu cuenta Flow.

- Prestashop versión 1.7.

- Verificar que tu tienda esté visible desde internet.

### Configuración de moneda de pago​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de E-commerce, es importante que tengas correctamente configurada la moneda de pago con la contratada en la plataforma de Flow.

Para verificar la configuración de la moneda:

- Ingresar a la administración de Prestashop.

- Ir a Internacional > Localización.

- Hacer clic en la pestaña Monedas y verificar la configuración.

### Descargar e instalar​
A continuación encontrarás las instrucciones para descargar e instalar Flow en tu carro de compras.

Descargar el módulo Pasarela Flow. Con este único módulo tu cliente podrá acceder a todos los medios de pago que tengas activados en tu cuenta Flow, sin requerir instalaciones adicionales.

### Instalar mediante instalador de módulos de Prestashop​
Para instalar el módulo desde el instalador incorporado en Prestashop debes:

- Entrar a la administración de Prestashop.

- Ir a Módulos > Catálogo de Módulos.

- Haz clic en Instalar módulo.

En la ventana desplegada debes:

- Seleccionar el archivo con la extensión .zip del módulo de Flow descargado.

- Arrastra el archivo o haz clic en Selecciona archivo.

- La instalación exitosa desplegará el mensaje “Módulo instalado”.

### Copiar los archivos directamente al FTP​
Para copiar los archivos directamente al FTP, debes descomprimir el archivo zip y subir las carpetas en la carpeta /modules/ de la instalación de Prestashop.
Sugerimos revisar los permisos de las carpetas y archivos una vez subidos al FTP, estos deben ser:

- Carpetas: 755

- Archivos: 644

### Actualizar plugin de Flow​
Si ya posees una versión del módulo de Flow instalada en tu Prestashop y deseas actualizarla, debes reemplazar los archivos antiguos por los archivos actualizados. Para ello tienes 2 opciones:

- Instalar el módulo mediante el instalador de módulos de Prestashop.

- Copiar los archivos directamente al FTP.

En los puntos anteriores Instalar mediante instalador de módulos de Prestashop y Copiar los archivos directamente al FTP puedes conocer el procedimiento para ambas opciones de actualización.

Luego, debes configurar el módulo tal como se muestra en el paso Configuración del medio de pago Flow.

### Configuración del medio de pago Flow​
Para configurar los módulos de Flow instalados debes realizar los siguientes pasos:

- Ir a Módulos > Gestor de módulos.

- Ubica el módulo de Flow que deseas configurar (sugerimos que en el campo de búsqueda escribas "Flow" para llegar más rápido al resultado).

- Haz clic en Configurar en el módulo.

En dicha ventana, debes configurar los siguientes campos:

CampoDescripciónPlataforma flowSelecciona si utilizarás la plataforma de producción o la plataforma sandbox de Flow:
-  Plataforma de producción Flow: Se encuentra disponible en www.flow.cl y corresponde al sitio oficial, el cual debes utilizar para recibir tus pagos. 
- Plataforma sandbox Flow: Se encuentra disponible en sandbox.flow.cl y corresponde al sitio de pruebas, donde podrás realizar pagos de test para verificar el correcto funcionamiento del plugin.Titulo medio de pagoIngresa el nombre que se mostrará a las personas cuando paguen en tu tienda virtual (dependiendo los medios de pago disponibles en el país donde operas), por ejemplo: 
- Flow: Pagar mediante Flow a través de tarjetas, transferencias bancarias, billeteras digitales, efectivo y más.Descripción del medio de pagoIngresa la descripción que se mostrará a las personas cuando paguen en tu tienda virtual (dependiendo los medios de pago disponibles en el país donde operas), por ejemplo:
- Pagar mediante Flow a través de tarjetas, transferencias bancarias, billeteras digitales, efectivo y más.Api KeyIngresa el Api Key asociado a tu cuenta de Flow: 
- Si estás utilizando la plataforma de producción: Obtén tu Api Key desde la sección Integraciones > Integración por API en flow.cl. 
- Si estás utilizando la plataforma sandbox: Obtén tu Api Key desde la sección Integraciones > Integración por API en sandbox.flow.cl.Cobro adicional (en %)Corresponde a un cobro adicional que puedes agregar al total del pedido. Este cobro adicional se define en porcentaje.Url de retornoCorresponde a la página donde volverá el cliente una vez que generó un cupón de pago. Recomendamos que dicha url sea la página principal de tu tienda.Logo a mostrarSi deseas modificar la imagen que por defecto se mostrará cuando un cliente pague en tu tienda virtual, puedes seleccionar una nueva haciendo clic en Seleccionar archivo. Una vez que guardes los cambios, se habrá actualizado la imagen.Click en "Guardar los cambios"Debes hacer clic en Guardar los cambios para confirmar tu configuración.

### Realizar pruebas en plataforma sandbox​
Para utilizar la plataforma sandbox debes:

- Registrarte previamente en sandbox.flow.cl.

- Configurar el plugin utilizando la plataforma sandbox. Para ello debes revisar el punto anterior.

- Una vez concretadas las pruebas, debes configurar el plugin utilizando la plataforma de producción. Para ello debes revisar el punto anterior.

### Tarjeta de prueba para Chile​
Podrás simular un pago de Chile mediante Webpay Plus con las siguientes tarjetas de prueba. Recuerda que el monto mínimo a pagar son $350 CLP.

### Pago exitoso​
DatoValorN° Tarjeta de Crédito4051885600446623Año de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVV123En la simulación del banco usar:Rut11.111.111-1Clave123

### Pago rechazado​
DatoValorN° Tarjeta de Crédito5186059559590568Año de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVV123En la simulación del banco usar:Rut11.111.111-1Clave123

### Tarjeta de prueba para Perú​
Podrás simular un pago de Perú con la siguiente tarjeta de prueba. Recuerda que el monto mínimo a pagar son 2 Soles.

DatoValorN° Tarjeta de Crédito5293138086430769Año de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVVCualquiera

### Tarjeta de prueba para México​
Podrás simular un pago de Perú con la siguiente tarjeta de prueba. Recuerda que el monto mínimo a pagar son MXP $ 12.00.

DatoValorN° Tarjeta de CréditoAño de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVVCualquiera

### Opciones avanzadas​
A continuación se muestran opciones adicionales para personalizar la configuración del plugin. Estas opciones requieren cierto nivel de conocimiento sobre HTML y programación.

### Tengo un error de integración​
Para conocer el error de integración debes revisar el archivo de log disponible en tu Prestashop. Para ubicar este registro debes:

- Entrar a la administración de Prestashop.

- Ir al menú Parámetros avanzados > Registros / Logs.

- Ubica el registro de la orden que deseas revisar.

Si no conoces como solucionar el problema de integración, puedes contactarnos al correo soporte@flow.cl, indicándonos el error, la plataforma de Flow que estás utilizando y tu Api Key.

### Se pierde la sesión del pagador​
Si al finalizar el flujo del pago se pierde la sesión iniciada del pagador en tu portal desarrollado con Prestashop 1.7.8.X, debes configurar el siguiente dato en tu tienda:

- Entrar a la administración de Prestashop.

- Ir al menú Parámetros avanzados > Administración.

- Ubica el título Configuración.

- En la opción Cookie SameSite debes seleccionar Ninguno.

- Haz click en Guardar.

### Permisos de carpetas y archivos de módulos Flow en el FTP​
En caso de error de integración se sugiere revisar los permisos de todas las carpetas y archivos de los módulos de Flow en su servidor FTP. Siendo los siguientes los permisos recomendados:

- Carpetas: 755

- Archivos: 644

Las carpetas y archivos de los módulos de Flow los encontrarás en la carpeta /modules/, en la raíz de la instalación de Prestashop.

Como ejemplo para un módulo de Flow los permisos serían los siguientes:

Carpetas de los módulos de Flow

Carpetas y archivos dentro de un módulo de Flow

---

## Guía de integración para PrestaShop

> Fuente: https://developers.flow.cl/docs/plugins/prestashop/version-1-6

- 

- Plugins
- PrestaShop
- Prestashop 1.6En esta página

### Guía de integración para PrestaShop
Si tienes una página e-commerce desarrollada con Prestashop 1.6, puedes integrar Flow mediante los módulos y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​
Para integrar Flow a tu sitio de E-commerce basado en Prestashop necesitas:

- Estar registrado en Flow como vendedor.

- Obtener el ApiKey y Secret Key desde la sección Integraciones > Integración por API de tu cuenta Flow.

- Prestashop versión 1.6.

- Verificar que tu tienda esté visible desde internet.

### Configurar pesos chilenos como moneda​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de E-commerce, es importante que se utilice el peso chileno como moneda.

Si has definido la locación en Chile y has importado la configuración, PrestaShop configurará esto de forma automática. Para estar seguro de ello te recomendamos realizar las siguientes verificaciones:

- Ingresar a la administración de Prestashop.

- Ir a Localización > Monedas.

- Hacer clic en Editar del registro Peso CLP.

En la edición de la moneda debes:

- Marcar campo Decimales con la opción No.

- Hacer clic en Guardar.

En forma adicional debes verificar el valor seleccionado para los siguientes campos:

- Ir a Preferencias > Configuración.

- Seleccionar en el campo Modo de redondeo la opción Redondeo al alza, cuando se ha pasado la mitad (recomendado).

- Seleccionar en el campo Tipo de redondeo la opción Redondea en el total.

- Ingresar en el campo Número de decimales un 0 (cero decimales).

- Hacer clic en Guardar.

### Descargar e instalar​
Con este módulo antes de enviar la transacción a un medio de pago, se presenta una página de Flow con los datos de la transacción. Además, en dicha página se muestran los medios de pago habilitados por el vendedor, permitiendo al pagador elegir el deseado.

Descargar el módulo Pasarela Flow.

### Instalar mediante instalador de módulos de Prestashop​
Para instalar el módulo desde el instalador incorporado en Prestashop debes:

- Entrar a la administración de Prestashop.

- Ir a Módulos y servicios > Módulos y servicios.

- Hacer clic en Añadir nuevo módulo.

En la ventana desplegada debes:

- Seleccionar el archivo con la extensión .zip del módulo de Flow descargado.

- Haz clic en Subir este módulo.

- La instalación exitosa desplegará el mensaje El módulo se ha descargado correctamente.

### Copiar los archivos directamente al FTP​
Para copiar los archivos directamente al FTP, debes descomprimir el archivo zip y subir las carpetas en la carpeta /modules/ de la instalación de Prestashop.

Sugerimos revisar los permisos de las carpetas y archivos una vez subidos al FTP, estos deben ser:

- Carpetas: 755

- Archivos: 644

### Actualizar módulo de Flow​
Si ya posees una versión del módulo de Flow instalada en tu Prestashop y deseas actualizarla, debes reemplazar los archivos antiguos por los archivos actualizados. Para ello tienes 2 opciones:

- Instalar el módulo mediante el instalador de módulos de Prestashop.

- Copiar los archivos directamente al FTP.

En los puntos anteriores Instalar mediante instalador de módulos de Prestashop y Copiar los archivos directamente al FTP puedes conocer el procedimiento para ambas opciones de actualización.

Luego, debes configurar el módulo tal como se muestra en el paso Configuración del medio de pago Flow.

### Habilitación del módulo Prestashop de Flow​
Para habilitar cada módulo debes realizar los siguientes pasos:

- Ir a Módulos y servicios > Módulos y servicios.

- Haz clic en Instalar para habilitar el módulo.

En el mensaje de advertencia haz clic en Seguir con la instalación.

### Configuración del medio de pago Flow​
Para configurar los módulos de Flow instalados debes realizar los siguientes pasos:

- Ir a Módulos y servicios > Módulos y servicios.

- Ubica el módulo de Flow que deseas configurar (sugerimos que en el campo de búsqueda escribas "Flow" para llegar más rápido al resultado).

- Haz clic en Configurar en el módulo activo.

En dicha ventana, debes configurar los siguientes campos:

CampoDescripciónPlataforma flowSelecciona si utilizarás la plataforma de producción o la plataforma sandbox de Flow:
-  Plataforma de producción Flow: Se encuentra disponible en www.flow.cl y corresponde al sitio oficial, el cual debes utilizar para recibir tus pagos. 
- Plataforma sandbox Flow: Se encuentra disponible en sandbox.flow.cl y corresponde al sitio de pruebas, donde podrás realizar pagos de test para verificar el correcto funcionamiento del plugin.Nombre del medio de pagoIngresa el nombre que se mostrará a las personas cuando paguen en tu tienda virtual (dependiendo los medios de pago disponibles en el país donde operas), por ejemplo: 
- Flow: Pagar mediante Flow a través de tarjetas, transferencias bancarias, billeteras digitales, efectivo y más.Api KeyIngresa el Api Key asociado a tu cuenta de Flow: 
- Si estás utilizando la plataforma de producción: Obtén tu Api Key desde la sección Integraciones > Integración por API en flow.cl. 
- Si estás utilizando la plataforma sandbox: Obtén tu Api Key desde la sección Integraciones > Integración por API en sandbox.flow.cl.Secret KeyIngresa el Secret Key asociado a tu cuenta de Flow: 
- Si estás utilizando la plataforma de producción: Obtén tu Secret Key desde la sección Integraciones > Integración por API en flow.cl. 
- Si estás utilizando la plataforma sandbox: Obtén tu Secret Key desde la sección Integraciones > Integración por API en sandbox.flow.cl.Cobro adicional (en %)Corresponde a un cobro adicional que puedes agregar al total del pedido. Este cobro adicional se define en porcentaje.Url de retornoCorresponde a la página donde volverá el cliente una vez que generó un cupón de pago. Recomendamos que dicha url sea la página principal de tu tienda.Logo a mostrarSi deseas modificar la imagen que por defecto se mostrará cuando un cliente pague en tu tienda virtual, puedes seleccionar una nueva haciendo clic en Seleccionar archivo. Una vez que guardes los cambios, se habrá actualizado la imagen.Click en "Guardar los cambios"Debes hacer clic en Guardar los cambios para confirmar tu configuración.

### Realizar pruebas en plataforma sandbox​
Para utilizar la plataforma sandbox debes:

- Registrarte previamente en sandbox.flow.cl.

- Configurar el módulo utilizando la plataforma sandbox. Para ello debes revisar el punto anterior.

- Una vez concretadas las pruebas, debes configurar el módulo utilizando la plataforma de producción. Para ello debes revisar el punto anterior.

### Tarjeta de prueba para Chile​
Podrás simular un pago de Chile mediante Webpay Plus con las siguientes tarjetas de prueba. Recuerda que el monto mínimo a pagar son $350 CLP.

### Pago exitoso​
DatoValorN° Tarjeta de Crédito4051885600446623Año de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVV123En la simulación del banco usar:Rut11.111.111-1Clave123

### Pago rechazado​
DatoValorN° Tarjeta de Crédito5186059559590568Año de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVV123En la simulación del banco usar:Rut11.111.111-1Clave123

### Tarjeta de prueba para Perú​
Podrás simular un pago de Perú con la siguiente tarjeta de prueba. Recuerda que el monto mínimo a pagar son 2 Soles.

DatoValorN° Tarjeta de Crédito5293138086430769Año de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVVCualquiera

### Tarjeta de prueba para México​
Podrás simular un pago de Perú con la siguiente tarjeta de prueba. Recuerda que el monto mínimo a pagar son MXP $ 12.00.

DatoValorN° Tarjeta de CréditoAño de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVVCualquiera

### Opciones avanzadas​
A continuación se muestran opciones adicionales para personalizar la configuración del módulo. Estas opciones requieren cierto nivel de conocimiento sobre HTML y programación.

### Tengo un error de integración​
Para conocer el error de integración debes revisar el archivo de log disponible en tu Prestashop. Para ubicar este registro debes:

- Entrar a la administración de Prestashop.

- Ir al menú Parámetros avanzados > Registros / Logs.

- Ubica el registro de la orden que deseas revisar.

Si no conoces como solucionar el problema de integración, puedes contactarnos al correo soporte@flow.cl, indicándonos el error, la plataforma de Flow que estás utilizando y tu Api Key.

---

## Shopify

> Fuente: https://developers.flow.cl/docs/plugins/shopify

- 

- Plugins
- ShopifyEn esta página

### Shopify
Si tienes una página e-commerce desarrollada con Shopify, puedes integrar Flow mediante el plugin y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​
Para integrar Flow a tu sitio de e-commerce basado en Shopify necesitas:

- Estar registrado en Flow como vendedor.

- Poseer una cuenta en Shopify.

- Asegurate que tu tienda se encuentre activa y visible desde internet.

### Configuración de moneda de pago​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de e-commerce, es importante que tengas correctamente configurada la moneda de pago con la contratada en la plataforma de Flow.

Para verificar la configuración de la moneda:

- Ingresar a la administración de Shopify.

- Ir a Configuración > opción Información de la tienda > sección Moneda de la tienda.

- En Moneda de la tienda verificar la configuración.

### Instalar y configurar Flow en tu tienda Shopify​
Para integrar Flow como medio de pago en tu tienda Shopify debes:

- En tu dashboard Shopify, dirígete al menú izquierdo opción Configuración.

- Luego haz click en Pagos.

- Dentro del panel haz click en el botón Agregar formas de pago.

- Haz click en la opción Buscar por proveedor, busca a FLOW y selecciónalo.

- Luego haz click en Activar.

- Haz click en Conectar.

- Haz click en Instalar APP.

- Haz click en Manage (administrar) para continuar.

- Hacer click en Iniciar para continuar con el proceso.

Ahora debes ingresar las credenciales de tu cuenta de Flow.

Paso 1:

- Ingresa el mail y contraseña de tu cuenta Flow (Las mismas credenciales con que inicias sesión en el portal Flow.cl).

- Haz click en Siguiente.

Paso 2:

- Si quieres hacer pruebas y tienes cuenta Sandbox con Flow, selecciona la opción Si tengo cuenta de prueba y completa los datos solicitados.

- Si no quieres hacer pruebas o no tienes cuenta sandbox, selecciona la opción No tengo o no necesito cuenta de prueba.

- Haz click en Siguiente.

Paso 3:
Corrobora tus datos, guarda tus API key y Secret key, haz click en Guardar configuración.

- Tu configuración de credenciales se habrá hecho con éxito.

Ahora ya tienes a Flow como medio de pago en Shopify.

### Generar reembolsos​
Con la aplicación de Flow para Shopify puedes generar directamente tus reembolsos:

Para crear un reembolso debes:

- Ingresar detalle del pedido en tu tienda.

- Haz click en Reembolso.

En los detalles del reembolso, se puede ver el estado de este.

Si el comercio no tiene los fondos suficientes, ya sea por comisiones o retiro de dinero, Flow rechazará la operación del reembolso indicando los fondos disponibles y los fondos necesarios para realizar el reembolso.

Si el comercio tiene los fondos suficientes para realizar el reembolso, el cliente recibirá un correo electrónico con los detalles del reembolso y la opción de aceptarlo. En este correo se incluirá una clave de seguridad, la cual será necesaria para aceptar el reembolso.

En el correo, el receptor debe hacer click en Continuar para ser redireccionado al sitio de Flow y así poder aceptar o rechazar el reembolso.

Una vez se acepte el reembolso. Se solicitará el nombre y teléfono del cliente más la clave de seguridad enviada anteriormente en el correo. Luego de eso, deberá hacer click en Aceptar.

Luego de aceptar, el reembolso será confirmado.

Finalmente, luego de unos minutos, el estado del reembolso será actualizado en el sitio

---

## Integración para Tiendanube

> Fuente: https://developers.flow.cl/docs/plugins/tiendanube

- 

- Plugins
- TiendanubeEn esta página

### Integración para Tiendanube
Si tienes una tienda desarrollada en Tiendanube, puedes integrar Flow como medio de pago y comenzar a recibir pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​
Para integrar a Flow en tu Tiendanube necesitas:

- Estar registrado en Flow como vendedor.

- Poseer una cuenta en Tiendanube.

- Asegurate que tu tienda se encuentre activa y visible desde internet.

### Configuración de moneda de pago​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de E-commerce, es importante que tengas correctamente configurada la moneda de pago con la contratada en la plataforma de Flow.

Para verificar la configuración de la moneda:

- Ingresar al dashboard de Tiendanube.

- Ir a menú Configuración > Idioma y monedas.

- En Divisa verificar la configuración sea “Chile, Pesos Chilenos”.

### Configurar Flow en Tiendanube​
En primer lugar, debes ingresar al panel de administrador de tu tienda:

- Ingresar al dashboard de Tiendanube.

- Ir a menú Configuración > Medios de pago.

- Buscar “Flow” en la lista de Medios de pago

- Clickear sobre el botón de Configurar, luego en Instalar, y finalmente en Aceptar y empezar a usar.

- La pantalla cambiara a nuestro Portal de integraciones, donde deberás ingresar con tus credenciales de Flow.

Una vez ingreses a tu cuenta correctamente visualizaras la siguiente pantalla de redirección:

Finalmente, tendrás disponible a Flow como medio de pago en tu Tiendanube.

Para validar que la integración se realizó correctamente:

- Ingresar al dashboard de Tiendanube.

- Ir a menú Configuración > Medios de pago

- Deberá aparecer Flow entre las primeras opciones en la sección de Tus medios de pago activos, tal como se visualiza en la siguiente imagen:

---

## Guía de integración para VirtueMart

> Fuente: https://developers.flow.cl/docs/plugins/virtuemart

- 

- Plugins
- VirtuemartEn esta página

### Guía de integración para VirtueMart
Si tienes una página e-commerce desarrollada en Joomla + VirtueMart, puedes integrar Flow mediante las extensiones y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Modelo de integración​
Toda la comunicación entre el comercio y Flow viaja firmada electrónicamente con certificados digitales. Las firmas digitales son verificadas en cada punto de comunicación, asegurando la confiabilidad entre el emisor y el receptor.
A continuación te explicamos los dos modelos de integración con Flow el indirecto y directo.

### Modo indirecto​
Con este modo de integración, antes de enviar la transacción a Webpay, Servipag o Multicaja, se presenta una página de Flow con los datos de la transacción. Además, en dicha página se muestran los medios de pago habilitados por el vendedor, permitiendo al pagador elegir el deseado.

N°Descripción de acciones1El comercio, utilizando el Kit, envía a Flow una Orden de Pago firmada electrónicamente.2Flow recibe la Orden y verifica que provenga de un comercio registrado. En este paso presenta una página para que el pagador confirme la orden y seleccione el medio de pago deseado: Webpay, Servipag o Multicaja.3Flow deriva al pagador a la página del medio de pago (Webpay, Servipag o Multicaja) seleccionado.4El medio de pago envía a Flow el resultado de la transacción y solicita confirmarla.5Flow envía el resultado del pago a la página de confirmación del comercio.6El comercio recibe la confirmación del pago. La página del comercio tiene 15 segundos para responder la recepción de la confirmación. Si su página de confirmación no responde en ese tiempo y la transacción había sido aprobada por el medio de pago, la transacción se dará por aprobada.7Flow envía al medio de pago la confirmación de la transacción.8Si el pago es exitoso, Flow deriva el control a la página de éxito del comercio. Además, se envía un email notificado del pago al vendedor y al pagador.9Si el pago es rechazado, Flow despliega su página de fracaso.10Desde la página de fracaso de Flow, si el cliente hace click en el botón (Volver al comercio) se invoca la página de fracaso del comercio.

### Modo directo​
Con este modo de integración Flow envía la transacción directo a Webpay, Servipag o Multicaja según corresponda, sin presentar una página de Flow con los datos de la transacción.

N°Descripción de acciones1El comercio, utilizando el Kit, envía a Flow una Orden de Pago firmada electrónicamente.2Flow deriva al pagador a la página del medio de pago (Webpay, Servipag o Multicaja) informado desde el Kit.3El medio de pago envía a Flow el resultado de la transacción y solicita confirmarla.4Flow envía el resultado del pago a la página de confirmación del comercio.5El comercio recibe la confirmación del pago. La página del comercio tiene 15 segundos para responder la recepción de la confirmación. Si su página de confirmación no responde en ese tiempo y la transacción había sido aprobada por el medio de pago, la transacción se dará por aprobada.6Flow envía al medio de pago la confirmación de la transacción.7Si el pago es exitoso Flow deriva el control a la página de éxito del comercio. Además, se envía un email notificado del pago al vendedor y al pagador.8Si el pago es rechazado Flow despliega su página de fracaso.9Desde la página de fracaso de Flow si el cliente hace clic en el botón (Volver al comercio) se invoca la página de fracaso del comercio.

### Requisitos​
Para integrar a Flow tu sitio de E-commerce basado en WooCommerce necesitas:

- Estar registrado en Flow como vendedor

- Descargar el Certificado digital desde Mis Datos

- Tener instalado VirtueMart 2 o 3

- Asegurarse que su tienda está visible desde internet

### Descargar e instalar​
Descargar Extensión Flow para Webpay VirtueMart 2

Descargar Extensión Flow para Servipag VirtueMart 2

Extensión Flow para MultiCaja VirtueMart 2: Pronto

Descargar Extensión Flow para Webpay VirtueMart 3

Descargar Flow para Servipag VirtueMart 3

Descargar Flow para MultiCaja VirtueMart 3

Una vez que hayas descargado las extensiones deseadas debes acceder al panel de administración de Joomla, dirigirte al menú Extensiones e ingresar al Gestor de extensiones.

En la pestaña Instalar debes cargar cada extensión descargada y presionar el botón Subir e instalar.

Si la instalación fue exitosa, al dirigirte a la pestaña Gestionar y buscar Flow deberías ver la siguiente pantalla.

### Actualizar extensión de Flow​
Si ya posees alguna versión de Flow instalada en tu VirtueMart y deseas actualizarla, tienes que desinstalar la versión anterior:

- Dirígete al panel de administración de Joomla, menú Extensiones

- Ingresa al Gestor de extensiones y haz clic en la pestaña Gestionar

- Busca y selecciona la extensión de Flow que quieres desinstalar

- Presiona el botón superior derecho Desinstalar

Una vez que hayas desinstalado la versión anterior, sigue las mismas instrucciones del paso Descargar e Instalar. Luego, configura la extensión como se muestra en el paso Configurar la extensión de Flow.

### Configuración de la extensión VirtueMart de Flow​
Para configurar una determinado extensión de Flow es necesario dirigirse al menú VirtueMart > Tienda > Métodos de pago > Clic en el ícono Nuevo, que encuentra en la esquina superior derecha.

Si no has agregado ningún método de pago, sigue las siguientes instrucciones:

Los datos que debes configurar en la ventana Información método de pago son:

CampoDescripciónNombre de método de pagoIngresa el nombre que se mostrará a las personas cuando paguen en tu tienda virtual, por ejemplo: 
- Flow: Pagar mediante Flow a través de Webpay, Servipag, Multicaja, Onepay y más.Descripción del medio de pagoIngresa la descripción que se mostrará a las personas cuando paguen en tu tienda virtual, por ejemplo:
- Flow Webpay: Pagar con tarjetas de crédito o débito bancarias
- Flow Servipag: Pagar con tarjetas CMR, Ripley o Cencosud
- Flow Multicaja: Pagar en efectivo en locales adheridos a Multicaja
- Flow: Pagar mediante plataforma de pagos Flow con Webpay, Servipag y Multicaja.Método de pagoSelecciona Flow Webpay, Flow Servipag o Flow Multicaja según corresponda.PublicadoSe recomienda seleccionar No mientras la configuración no esté realizada en forma total.MonedaSelecciona peso chilenoClick en "Guardar los cambios"Debes hacer clic en Guardar los cambios para confirmar tu configuración.
En la pestaña Configuración completa la siguiente información:

Los datos que debes configurar en la ventana configuración son:

CampoDescripciónPlataforma flowSelecciona si utilizarás la plataforma de producción o la plataforma sandbox de Flow:
-  Plataforma de producción Flow: Se encuentra disponible en flow.cl y corresponde al sitio oficial, el cual debes utilizar para recibir tus pagos. 
- Plataforma sandbox Flow: Se encuentra disponible en sandbox.flow.cl y corresponde al sitio de pruebas, donde podrás realizar pagos de test para verificar el correcto funcionamiento del plugin.Id Comercio FlowIngresa el email con el que estas registrado en flowUrl de retornoCorresponde a la página donde volverá el cliente una vez que generó un cupón de pago. Recomendamos que dicha url sea la página principal de tu tienda.Modo de accesoAquí debes seleccionar el tipo de integración deseado. 
- Ingresar directamente: Corresponde al modo directo de integración. Una vez que el cliente confirme el pago en el sitio web del comercio, se abrirá inmediatamente la pantalla de pagos de Webpay, Servipag o Multicaja, según corresponda. 
- Mostrar pasarela Flow: Corresponde al modo indirecto de integración. Previo al pago en Webpay, Servipag o Multicaja, se mostrará una ventana de Flow donde se indican los datos de la transacción (comercio, concepto, monto, email del pagador, etc). También se mostrarán al pagador los medios de pago que tenga habilitados el vendedor (Webpay, Servipag y/o Multicaja), pudiendo elegir el que desee.Llave Privada FlowPara obtener la llave privada se debe descargar el certificado digital desde mis datos, el cual corresponde a un archivo llamado comercio.pem. El archivo debes abrirlo con un editor de texto y copiar la totalidad de su contenido. Es importante verificar que el archivo se copió completamente.PaísChileMonedaCLP Chile pesosMonto mínimo y monto máximoSi el producto tiene un pago fuera de estos valores, no se ofrecerá flow como método de pagoEstado pendienteSeleccionar PendienteEstado exitosoSeleccionar ConfirmadoEstado fallidoSeleccionar CanceladoClick en "Guardar los cambios"Debes hacer clic en Guardar los cambios para confirmar tu configuración.
Debes hacer clic en el símbolo rojo Published. Si todo se ha realizado en forma correcta, dicho botón deberá cambiar a color verde.

### Validar configuración seleccionada​
Antes de comenzar a operar mediante Flow, te recomendamos validar la siguiente configuración:

- Si estás utilizando el sitio de pruebas sandbox:

- Plataforma de Flow: Debes seleccionar la opción "Plataforma de pruebas de Flow"

- ID Comercio Flow: Debes ingresar el email de la cuenta con que estás registrado en sandbox

- Llave privada Flow: Debes subir el último certificado digital descargado desde aquí

- Si estás utilizando el sitio de producción flow.cl:

- Plataforma de Flow: Debes seleccionar la opción "Plataforma oficial de Flow"

- ID Comercio Flow: Debes ingresar el email de la cuenta con que estás registrado en flow.cl

- Llave privada Flow: Debes utilizar el último certificado digital descargado desde flow.cl

Si estás utilizando el sitio de pruebas sandbox, puedes simular un pago mediante Webpay con las siguientes tarjetas:

### Pago exitoso​
Nº de tarjetas: 4051885600446623

Fecha de expiración: cualquiera

CVV: 123

En la simulación del banco debes usar:

RUT: 11.111.111-1

Clave: 123

### Pago rechazado​
Nº de tarjetas: 5186059559590568

Fecha de expiración: cualquiera

CVV: 123

En la simulación del banco debes usar:

RUT: 11.111.111-1

Clave: 123

### ¿Es posible tener sólo una extensión instalada y recibir pagos mediante Webpay, Servipag y Multicaja?​
Si es posible, para ello debes seguir las siguientes instrucciones:

- Verificar en la sección Medios de pago que tienes los medios de pago activados.

- Instalar una extensión, puede ser la extensión Flow Webpay, Flow Servipag o Flow Multicaja.

- Configurar la extensión como se describe en los puntos anteriores.

- En el modo de acceso, debes seleccionar la opción Mostrar pasarela Flow.

- En el nombre del medio de pago recomendamos poner un nombre genérico, por ejemplo "Pagar mediante plataforma de pagos Flow con Webpay, Servipag y Multicaja".

### Opciones avanzadas​
A continuación se muestran opciones adicionales para personalizar la configuración de la extensión. Estas opciones requieren cierto nivel de conocimiento sobre HTML y programación.

### Agregar imagen al medio de pago​
Debes seguir las siguientes instrucciones para mostrar una determinada imagen cuando el cliente elija el medio por el cual pagará.

- En primer lugar debes ingresar a la configuración de la extensión de Flow:

- Tienda -> Métodos de pago -> Flow Webpay -> Información del método de pago, para Flow Webpay

- Tienda -> Métodos de pago -> Flow Servipag -> Información del método de pago, para Flow Servipag

- Tienda -> Métodos de pago -> Flow Multicaja -> Información del método de pago, para Flow Multicaja

- En la opción Nombre de método de pago puedes ingresar la imagen que desees como código HTML, por ejemplo:

<!-- Pagar con tarjetas de crédito o débito bancarias --><img src='http://www.flow.cl/img/logo_webpay.png' width='80px'><!-- Pagar con tarjetas CMR, Ripley o Cencosud --><img src='http://www.flow.cl/img/BP_Servipag_peq.png' width='80px'><!-- Pagar en efectivo en locales adheridos a Multicaja --><img src='http://www.flow.cl/img/logo_multicaja_150_55.png' width='80px'>

- Finalmente se deben guardar los cambios y revisar que la imagen se muestre correctamente.

---

## Integración Flow con VTEX

> Fuente: https://developers.flow.cl/docs/plugins/vtex

- 

- Plugins
- VTEXEn esta página

### Integración Flow con VTEX
Si tu tienda está desarrollada en VTEX, puedes integrar Flow como medio de pago y comenzar a recibir pagos online.

¿Aún no tienes cuenta en Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos previos​
Para integrar Flow en tu tienda VTEX necesitas:

- Estar registrado en Flow como vendedor (con acceso a API Key y Secret Key).

- Tener una cuenta en VTEX con permisos de Admin (Payments).

- Que tu tienda esté activa y visible en internet (URLs públicas).

- Moneda de la tienda configurada en CLP (si contrataste Flow en CLP).

- Acceso al Portal Gateway de Flow: https://gateway.flow.cl/account (obligatorio para gestionar la integración).

Importante: El Portal Gateway es donde obtendrás las credenciales que usarás para vincular VTEX con Flow.

### Llaves secretas de Flow (API Key y Secret Key)​
Si no recuerdas tus credenciales, Accede a este enlace

Ahí podrás ver

- API Key → clave pública de integración asignada a tu comercio.

- Secret Key → clave privada para firmar la cadena enviada a flow(guárdala de forma segura).

### Configuración en el Portal Gateway de Flow​

- Ingresa a https://gateway.flow.cl/account con tus credenciales de Flow.

- Ubica el formulario de credenciales, se deben rellenar en la siguiente sección:

- Ingresa tu API Key y Secret Key → clic en Probar Integración.

- Si es correcto, aparecerá: “La Integración fue Exitosa”.

- Si no, debes revisar tus credenciales, ya que podría existir un error en el copiar las llaves desde tu cuenta de flow (Ingresa aquí para ver tus llaves) o también recomendamos revisar el punto.

- Una vez que el mensaje diga que la integración fue exitosa se debe dar click a guardar.

- En el menú lateral, selecciona VTEX.

- Copia los valores:

- Clave de aplicación (App Key)

- Token de aplicación (App Token) Estos parámetros los usarás en la configuración de VTEX.

### Verificar moneda en VTEX​
La divisa de tu tienda en VTEX debe coincidir con la contratada en Flow.

- Ingresa al VTEX Admin.

- Menú → Configuración de la tienda → Canales → Políticas comerciales.

- Confirma que la moneda sea Chile – Peso Chileno (CLP).

### Configuración de Flow en VTEX​

### Paso 1: Configurar proveedor Flow en VTEX​
Ruta: Configuración de la tienda → Pagos → Proveedores 
(en inglés: Payments → Settings → Payment Methods (Gateways/Providers))

- Ingresa al VTEX Admin.

- Ve a Pagos → Proveedores y busca "Flow".

- Haz clic en Flow. Se abrirá una nueva ventana con el formulario de configuración.

- Completa los campos con la información del Portal Gateway:

- Autorización del proveedor

- Clave de aplicación (App Key)

- Token de aplicación (App Token)

- Opciones:

- Activar modo de prueba: No habilitado.

- Liquidación automática: elige según tu política de captura/liquidación.

- Guarda los cambios.

### Paso 2: Configurar condición de pago Flow en VTEX​
Ruta: Configuración de la tienda → Pagos → Configuración 
(Payments → Settings → Payment Conditions)

- Ingresa al VTEX Admin.

- Haz clic en + Nuevo.

- En la lista de categorías, baja hasta Otros (Others).

- Selecciona Flow Pagos.

- Configura:

- Nombre interno: “Flow” o “Flow Pagos”.

- Proveedor asociado: selecciona Flow (el proveedor configurado en el Paso 1).

- Activar condición de pago: habilita el switch.

- Guarda los cambios.

### Validar la integración​

- En VTEX Admin ve a: Configuración de la tienda → Pagos → Configuración.

- Verifica que Flow aparezca en la lista de medios de pago activos.

- Realiza una compra de prueba para confirmar el flujo.

### Flujo de pago (alto nivel)​

- El comprador selecciona Flow en el checkout de VTEX.

- VTEX crea la transacción y redirige/invoca el Create Payment en Flow.

- El cliente paga en la pasarela de Flow.

- Flow:

- Redirige al comprador a la URL de confirmación con el resultado.

- Envía una notificación firmada (callback) a la tienda VTEX.

- VTEX confirma el estado y actualiza la orden.

### Preguntas Frecuentes (FAQ)​

### 1. ¿Qué hago si Flow no aparece en la lista de proveedores de VTEX?​
Verifica que tu cuenta de VTEX tenga habilitados los permisos de Admin (Payments).
Si aún no aparece, abre un ticket con el soporte de VTEX para que activen el proveedor Flow en tu cuenta.

### 2. ¿Qué pasa si la integración de credenciales falla en el Portal Gateway?​
Asegúrate de copiar la API Key y Secret Key completas, sin espacios adicionales.
Revisa que estés usando las credenciales vigentes desde el Dashboard de Flow.
Si el error persiste, genera nuevas llaves desde el portal de Flow.

### 3. ¿Puedo usar Flow en modo prueba antes de salir a producción?​
Por el momento no se encuentra disponible el modo de prueba, se encuentra en proceso de desarrollo.

### 4. ¿Qué medios de pago estarán disponibles en Flow dentro de VTEX?​
Los medios de pago dependen de los que tengas contratados en tu cuenta Flow (ejemplo: tarjetas crédito/débito, Servipag, Onepay, transferencias, etc.).

Solo se mostrarán en VTEX los que estén activos en tu contrato con Flow.

### 5. ¿Qué hago si el cliente paga, pero la orden no cambia de estado en VTEX?​
Te recomendamos que te comuniques directamente con soporte@flow.cl para que podamos revisar la razón del no cambio de estado de la orden.

### 6. ¿Puedo vender en otra moneda distinta de CLP?​
Sí, es posible, pero dependerá de los medios de pago que tengas contratados en tu cuenta Flow.

En caso de que el comprador use una tarjeta extranjera, la conversión se realizará en base a la moneda enviada al momento de generar la orden, aplicando el tipo de cambio y comisiones definidas por el banco o emisor de la tarjeta.

- 
Posibles Fallas envió incorrecto de Divisa.

- Si tu tienda envía un pago en una moneda que no está habilitada en tu contrato de flow, el sistema retornará un error de validación y el pago podría no ser procesado. Esto aplicara siempre que se mande una moneda diferente a las contratadas en tu cuenta de flow.

---

## Guía de integración para WHMCS

> Fuente: https://developers.flow.cl/docs/plugins/whmcs

- 

- Plugins
- WHMCSEn esta página

### Guía de integración para WHMCS
Si tienes una página e-commerce desarrollada con WHMCS, puedes integrar Flow mediante los módulos y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​
Para integrar Flow a tu plataforma WHMCS necesitas:

- Estar registrado en Flow como vendedor.

- Obtener el ApiKey y Secret Key desde la sección Integraciones > Integración por API de tu cuenta Flow.

- WHMCS versión 7.

- Verificar que tu plataforma esté visible desde internet.

### Configurar pesos chilenos como moneda​
Para asegurarte que los pagos sean correctamente informados por Flow a tu plataforma, es importante que se utilice el peso chileno como moneda. Para agregar dicha moneda debes:

- Ingresar a la administración de WHMCS.

- Ir a Ajustes > Formas de pago > Monedas.

- Haz clic en la opción Editar de la moneda por defecto o añade una moneda adicional.

En dicho formulario debes completar los campos con los siguientes valores:

- Ingresar en Código de moneda CLP (Peso chileno).

- Ingresar en Prefijo $.

- Ingresar en Sufijo CLP.

- Selecciona en Formato 1.234,56.

- Ingresar en Cambio 1.00000.

- Hacer clic en Guardar los cambios.

### Descargar e instalar​

- Módulo Flow Webpay: Con este módulo Flow envía la transacción directo a Webpay, sin presentar una página de Flow con los datos de la transacción.

- Módulo Flow Servipag: Con este módulo Flow envía la transacción directo a Servipag, sin presentar una página de Flow con los datos de la transacción.

- Módulo Flow Multicaja: Con este módulo Flow envía la transacción directo a Multicaja, sin presentar una página de Flow con los datos de la transacción.

- Módulo Flow Onepay: Con este módulo Flow envía la transacción directo a Onepay, sin presentar una página de Flow con los datos de la transacción.

- Módulo Pasarela Flow: Con este módulo antes de enviar la transacción a un medio de pago, se presenta una página de Flow con los datos de la transacción. Además, en dicha página se muestran los medios de pago habilitados por el vendedor, permitiendo al pagador elegir el deseado.

### Copiar los archivos directamente al FTP​
Para copiar los archivos directamente al FTP, debes descomprimir el archivo zip y subir las carpetas Modules y Templates en la carpeta raíz de tu plataforma WHMCS.

### Actualizar extensión de Flow​
Si ya posees una versión del módulo de Flow instalada en tu plataforma WHMCS y deseas actualizarla, debes reemplazar los archivos antiguos por los archivos actualizados.

Luego, debes configurar el módulo tal como se muestra en el paso Configuración del medio de pago Flow.

### Habilitación del módulo WHMCS de Flow​
Para habilitar cada módulo sigue las siguientes instrucciones:

- Ir a Ajustes > Formas de pago > Pasarela de pago.

- Hacer clic en la pestaña All Payment Gateways.

- En dicha ventana, podrás encontrar los módulos de Flow que has agregado.

- A continuación, debes activar los módulos que desees utilizar, haciendo clic sobre él. Los módulos activos se diferencian por el color verde de la caja

### Configuración del medio de pago Flow​
Para configurar los módulos de Flow instalados sigue las siguientes instrucciones:

- Ir a Ajustes > Formas de pago > Pasarela de pago.

- Hacer clic en la pestaña Manage Existing Gateways.

- Para continuar, ubicar el medio de pago que desees configurar.

En dicha ventana, debes configurar los siguientes campos:

### Realizar pruebas en plataforma sandbox​
Para utilizar la plataforma sandbox debes:

- Registrarte previamente en sandbox.flow.cl.

- Configurar el plugin utilizando la plataforma sandbox. Para ello debes revisar el punto anterior.

- Finalmente, podrás simular un pago mediante Webpay Plus con las siguientes tarjetas de prueba. Recuerda que el monto mínimo a pagar son $350 CLP.

- Una vez concretadas las pruebas, debes configurar el plugin utilizando la plataforma de producción. Para ello debes revisar el punto anterior.

### Pago exitoso​
Nº de tarjetas: 4051885600446623

Fecha de expiración: cualquiera

CVV: 123

En la simulación del banco debes usar:

RUT: 11.111.111-1

Clave: 123

### Pago rechazado​
Nº de tarjetas: 5186059559590568

Fecha de expiración: cualquiera

CVV: 123

En la simulación del banco debes usar:

RUT: 11.111.111-1

Clave: 123

### Opciones avanzadas​
A continuación se muestran opciones adicionales para personalizar la configuración de la extensión. Estas opciones requieren cierto nivel de conocimiento sobre HTML y programación.

### Tengo un error de integración​
Para conocer el error de integración debes revisar al archivo de log disponible en tu WHMCS. Para ubicar este registro debes:

- Ir a Utilidades > Registros > Registro de actividad.

- Ubica el registro de la orden que deseas revisar.

Si no conoces como solucionar el problema de integración, puedes contactarnos al correo soporte@flow.cl, indicándonos el error, la plataforma de Flow que estás utilizando y tu Api Key.

---

## Integración para Wix

> Fuente: https://developers.flow.cl/docs/plugins/wix

- 

- Plugins
- WixEn esta página

### Integración para Wix
Si tienes una tienda desarrollada en Wix, puedes integrar Flow como medio de pago y comenzar a recibir pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​
Para integrar a Flow en tu tienda Wix necesitas:

- Estar registrado en Flow como vendedor.

- Poseer una cuenta en Wix.

- Asegurate que tu tienda se encuentre activa y visible desde internet.

### Configuración de moneda de pago​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de E-commerce, es importante que tengas correctamente configurada la moneda de pago con la contratada en la plataforma de Flow.

Para verificar la configuración de la moneda:

- Ingresar al dashboard de Wix.

- Ir a menú Ajustes > Idioma y región.

- En Divisa verificar la configuración.

### Obtener datos para la configuración de la tienda Wix​
En primer lugar debes obtener los datos necesarios para realizar la integración. Para ello debes:

- Ingresar al Portal de integraciones.

- Iniciar sesión con tus datos de acceso (correo electrónico y contraseña) asociados a tu cuenta Flow.

- Ingresar tu ApiKey y SecretKey obtenidos desde la sección Integraciones > Integración por API de tu cuenta Flow.

- Haz clic en Probar integración.

- Guardar los cambios.

- Hacer click en la sección Crear cuenta Wix.

- Obtener los datos necesarios para configurar a Flow como medio de pago.

### Configurar la tienda Wix​
Para integrar Flow como medio de pago en tu tienda Wix debes:

- Ingresa a la configuración de tu tienda Wix en una nueva pestaña.

- Haz click en el menú Ajustes> Acepta pagos.

- Más opciones de pago > Flow.

- Debes ingresar los datos entregados en el portal de integraciones para los campos email, Client Key y Client Secret.

Finalmente, tendrás disponible a Flow como medio de pago en tu tienda Wix.

### Generar reembolsos​
La gestión de reembolsos se realiza desde el portal privado de Flow. Aunque puedes iniciar el proceso desde el portal de Wix, este te redirigirá automáticamente al portal privado de Flow.

Para crear un reembolso, sigue estos pasos:

- Accede al detalle del pedido en tu tienda.

- Ingresa a Más Acciones.

- Selecciona la opción Cancelar y reembolsar.

A continuación, se mostrará el detalle del reembolso junto con una nota indicando que este debe gestionarse desde el portal privado de Flow.

Si bien es posible editar el monto a reembolsar y agregar notas, estos ajustes son únicamente para mantener la consistencia al realizar el reembolso en el portal privado de Flow.

El siguiente paso permite redirigir al portal privado de Flow para realizar el reembolso.

Al presionar el botón Confirmar e ir a Flow, serás dirigido a la pantalla de reembolsos en el portal privado de Flow.

---

## Guía de integración para WooCommerce 8 y superiores

> Fuente: https://developers.flow.cl/docs/plugins/woocommerce/latest

- 

- Plugins
- Woocommerce
- Woocommerce 8.0En esta página

### Guía de integración para WooCommerce 8 y superiores
Si tienes una página e-commerce desarrollada con WooCommerce, puedes integrar Flow mediante el plugin y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​

- Para integrar Flow a tu sitio de e-commerce basado en WooCommerce necesitas:

- Estar registrado en Flow como vendedor.

- Obtener el ApiKey desde la sección Integraciones > Integración por API.

- WooCommerce versión 8.3.1 o superior.

- Verificar que tu tienda esté visible desde internet.

### Configuración de moneda de pago​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de e-commerce, es importante que tengas correctamente configurada la moneda de pago con la contratada en la plataforma de Flow.

Para verificar la configuración de la moneda:

- Ingresar a la administración de Wordpress.

- Ir a WooCommerce > Ajustes > Opciones de moneda.

- En Moneda verificar la configuración.

### Descargar e instalar​
A continuación encontrarás las instrucciones para descargar e instalar Flow en tu carro de compras.

Descargar el plugin Pasarela Flow Con este único plugin tu cliente podrá acceder a todos los medios de pago que tengas activados en tu cuenta Flow, sin requerir instalaciones adicionales.

### Instalar mediante instalador de plugins de Wordpress​
Para instalar el plugin desde el instalador incorporado en Wordpress debes:

- Entrar a la administración de Wordpress.

- Ir a Plugins > Agregar nuevo.

- Haz clic en Subir Plugin y luego en Seleccionar archivo. En este punto debes seleccionar el archivo del plugin que deseas instalar (los plugins instalables de Wordpress incluyen la extensión zip en su nombre de archivo).

- La instalación comenzará una vez hagas clic en Instalar ahora.

### Copiar los archivos directamente al FTP​
Para copiar los archivos directamente al FTP, debes descomprimir el archivo zip y subir las carpetas y archivos contenidos en la carpeta /wp-content/plugins/ de la instalación de Wordpress.

### Actualizar plugin de Flow​
Si ya posees una versión del plugin de Flow instalada en tu Wordpress con WooCommerce y deseas actualizarla, debes reemplazar los archivos antiguos por los archivos actualizados. Para ello tienes 2 opciones:

- Instalar el plugin mediante el instalador de plugins de Wordpress.

- Copiar los archivos directamente al FTP.

En los puntos anteriores Instalar mediante instalador de plugins de Wordpress y Copiar los archivos directamente al FTP puedes conocer el procedimiento para ambas opciones de actualización.

Luego, debes configurar el plugin tal como se muestra en el paso Configuración del medio de pago Flow.

### Habilitación del plugin WooCommerce de Flow​
Para habilitar cada plugin sigue las siguientes instrucciones:

- En el menú de administración de Wordpress selecciona Plugins > Plugins instalados.

- En dicha ventana, podrás encontrar los plugins de Flow que has agregado.

- A continuación, debes activar los plugins que desees utilizar, haciendo clic en Activar.

### Configuración del medio de pago Flow​
Para configurar los plugins de Flow instalados sigue las siguientes instrucciones:

- En el menú de administración de Wordpress selecciona WooCommerce > Ajustes.

- A continuación haz clic en la opción Pagos.

- Para continuar, haz clic en Gestionar o en el título del medio de pago que desees configurar.

En dicha ventana, debes configurar los siguientes campos:

CampoDescripciónPlataforma flowSelecciona si utilizarás la plataforma de producción o la plataforma sandbox de Flow:
-  Plataforma de producción Flow: Se encuentra disponible en www.flow.cl y corresponde al sitio oficial, el cual debes utilizar para recibir tus pagos. 
- Plataforma sandbox Flow: Se encuentra disponible en sandbox.flow.cl y corresponde al sitio de pruebas, donde podrás realizar pagos de test para verificar el correcto funcionamiento del plugin.Titulo medio de pagoIngresa el nombre que se mostrará a las personas cuando paguen en tu tienda virtual (dependiendo los medios de pago disponibles en el país donde operas), por ejemplo: 
- Flow: Pagar mediante Flow a través de tarjetas, transferencias bancarias, billeteras digitales, efectivo y más.Descripción del medio de pagoIngresa la descripción que se mostrará a las personas cuando paguen en tu tienda virtual (dependiendo los medios de pago disponibles en el país donde operas), por ejemplo:
- Pagar mediante Flow a través de tarjetas, transferencias bancarias, billeteras digitales, efectivo y más.Api KeyIngresa el Api Key asociado a tu cuenta de Flow: 
- Si estás utilizando la plataforma de producción: Obtén tu Api Key desde la sección Integraciones > Integración por API en flow.cl. 
- Si estás utilizando la plataforma sandbox: Obtén tu Api Key desde la sección Integraciones > Integración por API en sandbox.flow.cl.Url de retornoCorresponde a la página donde volverá el cliente una vez que generó un cupón de pago. Recomendamos que dicha url sea la página principal de tu tienda.Logo a mostrarSi deseas modificar la imagen que por defecto se mostrará cuando un cliente pague en tu tienda virtual, puedes seleccionar una nueva haciendo clic en Seleccionar archivo. Una vez que guardes los cambios, se habrá actualizado la imagen.Click en "Guardar los cambios"Debes hacer clic en Guardar los cambios para confirmar tu configuración.

### Realizar pruebas en plataforma sandbox​
Para utilizar la plataforma sandbox debes:

- Registrarte previamente en sandbox.flow.cl.

- Configurar el plugin utilizando la plataforma sandbox. Para ello debes revisar el punto anterior.

- Una vez concretadas las pruebas, debes configurar el plugin utilizando la plataforma de producción. Para ello debes revisar el punto anterior.

### Tarjeta de prueba para Chile​
Podrás simular un pago de Chile mediante Webpay Plus con las siguientes tarjetas de prueba. Recuerda que el monto mínimo a pagar son $350 CLP.

### Pago exitoso​
DatoValorN° Tarjeta de Crédito4051885600446623Año de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVV123En la simulación del banco usar:Rut11.111.111-1Clave123

### Pago rechazado​
DatoValorN° Tarjeta de Crédito5186059559590568Año de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVV123En la simulación del banco usar:Rut11.111.111-1Clave123

### Tarjeta de prueba para Perú​
Podrás simular un pago de Perú con la siguiente tarjeta de prueba. Recuerda que el monto mínimo a pagar son 2 Soles.

DatoValorN° Tarjeta de Crédito5293138086430769Año de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVVCualquiera

### Tarjeta de prueba para México​
Podrás simular un pago de Perú con la siguiente tarjeta de prueba. Recuerda que el monto mínimo a pagar son MXP $ 12.00.

DatoValorN° Tarjeta de CréditoAño de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVVCualquiera

### Opciones avanzadas​
A continuación se muestran opciones adicionales para personalizar la configuración del plugin. Estas opciones requieren cierto nivel de conocimiento sobre HTML y programación.

### Tengo un error de integración​
Para conocer el error de integración debes revisar al archivo de log disponible en tu WooCommerce. Para ubicar este registro debes:

- Entrar a la administración de Wordpress.

- Ir al menú WooCommerce > Estado.

- Hacer clic en la opción Registros.

- Ubica el registro de la orden que deseas revisar. El nombre de dicho registro seguirá la estructura: "flow_"versión-fecha, por ejemplo, flow_3.0.6-2024-02-09.

Si no conoces como solucionar el problema de integración, puedes contactarnos al correo soporte@flow.cl, indicándonos el error, la plataforma de Flow que estás utilizando y tu Api Key.

---

## Guía de integración para WooCommerce 7.8 y anteriores

> Fuente: https://developers.flow.cl/docs/plugins/woocommerce/version-7-8

- 

- Plugins
- Woocommerce
- Woocommerce 7.8En esta página

### Guía de integración para WooCommerce 7.8 y anteriores
Si tienes una página e-commerce desarrollada con WooCommerce, puedes integrar Flow mediante el plugin y comenzar a operar con pagos online.

¿No eres parte de Flow? Antes de continuar, debes registrarte en Flow y seleccionar la opción Quiero recibir pagos a través de Flow. Si aún no tienes una cuenta regístrate aquí.

### Requisitos​

- Para integrar Flow a tu sitio de e-commerce basado en WooCommerce necesitas:

- Estar registrado en Flow como vendedor.

- Obtener el ApiKey desde la sección Integraciones > Integración por API de tu cuenta Flow.

- WooCommerce versión 4, 5, 6, 7 y 7.8.1.

- Verificar que tu tienda esté visible desde internet.

### Configuración de moneda de pago​
Para asegurarte que los pagos sean correctamente informados por Flow a tu sitio de e-commerce, es importante que tengas correctamente configurada la moneda de pago con la contratada en la plataforma de byFlow.

Para verificar la configuración de la moneda:

- Ingresar a la administración de Wordpress.

- Ir a WooCommerce > Ajustes > Opciones de moneda.

- En Moneda verificar la configuración.

### Descargar e instalar​
A continuación encontrarás las instrucciones para descargar e instalar Flow en tu carro de compras.

Descargar el plugin Pasarela Flow Con este único plugin tu cliente podrá acceder a todos los medios de pago que tengas activados en tu cuenta Flow, sin requerir instalaciones adicionales.

### Instalar mediante instalador de plugins de Wordpress​
Para instalar el plugin desde el instalador incorporado en Wordpress debes:

- Entrar a la administración de Wordpress.

- Ir a Plugins > Agregar nuevo.

- Haz clic en Subir Plugin y luego en Seleccionar archivo. En este punto debes seleccionar el archivo del plugin que deseas instalar (los plugins instalables de Wordpress incluyen la extensión zip en su nombre de archivo).

- La instalación comenzará una vez hagas clic en Instalar ahora.

### Copiar los archivos directamente al FTP​
Para copiar los archivos directamente al FTP, debes descomprimir el archivo zip y subir las carpetas y archivos contenidos en la carpeta /wp-content/plugins/ de la instalación de Wordpress.

### Actualizar plugin de Flow​
Si ya posees una versión del plugin de Flow instalada en tu Wordpress con WooCommerce y deseas actualizarla, debes reemplazar los archivos antiguos por los archivos actualizados. Para ello tienes 2 opciones:

- Instalar el plugin mediante el instalador de plugins de Wordpress.

- Copiar los archivos directamente al FTP.

En los puntos anteriores "Instalar mediante instalador de plugins de Wordpress" y "Copiar los archivos directamente al FTP" puedes conocer el procedimiento para ambas opciones de actualización.

Luego, debes configurar el plugin tal como se muestra en el paso "Configuración del medio de pago Flow".

### Habilitación del plugin WooCommerce de Flow​
Para habilitar cada plugin sigue las siguientes instrucciones:

- En el menú de administración de Wordpress selecciona Plugins > Plugins instalados.

- En dicha ventana, podrás encontrar los plugins de Flow que has agregado.

- A continuación, debes activar los plugins que desees utilizar, haciendo clic en Activar.

### Configuración del medio de pago Flow​
Para configurar los plugins de Flow instalados sigue las siguientes instrucciones:

- En el menú de administración de Wordpress selecciona WooCommerce > Ajustes.

- A continuación haz clic en la opción Pagos.

- Para continuar, haz clic en Gestionar o en el título del medio de pago que desees configurar.

En dicha ventana, debes configurar los siguientes campos:

CampoDescripciónPlataforma flowSelecciona si utilizarás la plataforma de producción o la plataforma sandbox de Flow:
-  Plataforma de producción Flow: Se encuentra disponible en www.flow.cl y corresponde al sitio oficial, el cual debes utilizar para recibir tus pagos. 
- Plataforma sandbox Flow: Se encuentra disponible en sandbox.flow.cl y corresponde al sitio de pruebas, donde podrás realizar pagos de test para verificar el correcto funcionamiento del plugin.Titulo medio de pagoIngresa el nombre que se mostrará a las personas cuando paguen en tu tienda virtual (dependiendo los medios de pago disponibles en el país donde operas), por ejemplo: 
- Flow: Pagar mediante Flow a través de tarjetas, transferencias bancarias, billeteras digitales, efectivo y más.Descripción del medio de pagoIngresa la descripción que se mostrará a las personas cuando paguen en tu tienda virtual (dependiendo los medios de pago disponibles en el país donde operas), por ejemplo:
- Pagar mediante Flow a través de tarjetas, transferencias bancarias, billeteras digitales, efectivo y más.Api KeyIngresa el Api Key asociado a tu cuenta de Flow: 
- Si estás utilizando la plataforma de producción: Obtén tu Api Key desde la sección Integraciones > Integración por API en flow.cl. 
- Si estás utilizando la plataforma sandbox: Obtén tu Api Key desde la sección Integraciones > Integración por API en sandbox.flow.cl.Url de retornoCorresponde a la página donde volverá el cliente una vez que generó un cupón de pago. Recomendamos que dicha url sea la página principal de tu tienda.Logo a mostrarSi deseas modificar la imagen que por defecto se mostrará cuando un cliente pague en tu tienda virtual, puedes seleccionar una nueva haciendo clic en Seleccionar archivo. Una vez que guardes los cambios, se habrá actualizado la imagen.Click en "Guardar los cambios"Debes hacer clic en Guardar los cambios para confirmar tu configuración.

### Realizar pruebas en plataforma sandbox​
Para utilizar la plataforma sandbox debes:

- Registrarte previamente en sandbox.flow.cl.

- Configurar el plugin utilizando la plataforma sandbox. Para ello debes revisar el punto anterior.

- Una vez concretadas las pruebas, debes configurar el plugin utilizando la plataforma de producción. Para ello debes revisar el punto anterior.

### Tarjeta de prueba para Chile​
Podrás simular un pago de Chile mediante Webpay Plus con las siguientes tarjetas de prueba. Recuerda que el monto mínimo a pagar son $350 CLP.

### Pago exitoso​
DatoValorN° Tarjeta de Crédito4051885600446623Año de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVV123En la simulación del banco usar:Rut11.111.111-1Clave123

### Pago rechazado​
DatoValorN° Tarjeta de Crédito5186059559590568Año de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVV123En la simulación del banco usar:Rut11.111.111-1Clave123

### Tarjeta de prueba para Perú​
Podrás simular un pago de Perú con la siguiente tarjeta de prueba. Recuerda que el monto mínimo a pagar son 2 Soles.

DatoValorN° Tarjeta de Crédito5293138086430769Año de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVVCualquiera

### Tarjeta de prueba para México​
Podrás simular un pago de Perú con la siguiente tarjeta de prueba. Recuerda que el monto mínimo a pagar son MXP $ 12.00.

DatoValorN° Tarjeta de CréditoAño de ExpiraciónCualquieraMes de ExpiraciónCualquieraCVVCualquiera

### Opciones avanzadas​
A continuación se muestran opciones adicionales para personalizar la configuración del plugin. Estas opciones requieren cierto nivel de conocimiento sobre HTML y programación.

### Tengo un error de integración​
Para conocer el error de integración debes revisar al archivo de log disponible en tu WooCommerce. Para ubicar este registro debes:

- Entrar a la administración de Wordpress.

- Ir al menú WooCommerce > Estado.

- Hacer clic en la opción Registros.

- Ubica el registro de la orden que deseas revisar. El nombre de dicho registro seguirá la estructura: "flow_"versión-fecha, por ejemplo, flow_3.0.5-2024-02-09.

Si no conoces como solucionar el problema de integración, puedes contactarnos al correo soporte@flow.cl, indicándonos el error, la plataforma de Flow que estás utilizando y tu Api Key.

---

## Quickstart

> Fuente: https://developers.flow.cl/docs/quick-start

- 

- Quickstart

### QuickstartEl propósito de esta guía es que usted configure su entorno de desarrollo local y cree una orden de pago de la manera más sencilla y rápida posible.

- NodeJS
- PythonLo primero que debe hacer es crear un directorio para su proyecto y crear la configuración de nodejs de la siguiente manera

mkdir flow-nodejscd flow-nodejsnpm init -y

Luego debe instalar alguna dependencias necesarias para facilitar la integración

npm i axios dotenv

Cree archivo con sus variables de entorno

[project_path]/.env

API_KEY=SECRET_KEY=

Luego cree un archivo main.js e importe dependencias necesarias y cargue sus variables de entorno definidas en .env

[project_path]/main.js

const crypto = require('node:crypto')const axios = require('axios')const dotenv = require('dotenv')const querystring = require('node:querystring')dotenv.config({  path:'./.env'})const config = {    apiUrl:"https://sandbox.flow.cl/api",    apiKey:process.env.API_KEY,    secretKey:process.env.SECRET_KEY}

Cree un objeto con los parámetros requeridos por el servicio payment/create

const params = {    apiKey:config.apiKey,    commerceOrder: crypto.randomUUID(),    urlConfirmation:'https://mydomain.com/confirmation',    urlReturn:'https://mydomain.com/payment-status',    email: 'juanperez123@gmail.com',    subject:'Compra de articulos en tienda online',    amount:30000}

Una vez con el objeto de los parámetros listo, usted debe generar la firma y agregarla de la siguiente manera

const secretKey = config.secretKey;const keys = Object.keys(params);keys.sort();let toSign = "";for (let i = 0; i < keys.length; i++) {let key = keys[i];toSign += key + params[key];}const signature = crypto.createHmac("sha256",secretKey).update(toSign).digest("hex")const body = {    ...params,    s:signature}

Una vez con el objeto listo, debe transformarlo a formato url encoded y hacer la petición https, con los datos creados de la siguiente manera:

const encodedBody = querystring.stringify(body)axios.post(`${config.apiUrl}/payment/create`,encodedBody)    .then((response)=>console.log("checkout url",`${response.data.url}?token=${response.data.token}`))    .catch((error)=>console.error(error))

Una vez el llamado a la api resuelva la respuesta, abra el navegador en la url logeada y podrá ver el checkout de flow donde podrá pagar la orden generada

Vea script completo

const crypto = require('node:crypto');const axios = require('axios');const dotenv = require('dotenv');const querystring = require('node:querystring');dotenv.config({path:'./.env'});const config = {apiUrl: "https://sandbox.flow.cl/api",apiKey: process.env.API_KEY,secretKey: process.env.SECRET_KEY};const params = {apiKey: config.apiKey,commerceOrder: crypto.randomUUID(),urlConfirmation: 'https://mydomain.com/confirmation',urlReturn: 'https://mydomain.com/payment-status',email: 'juanperez123@gmail.com',subject: 'Compra de articulos en tienda online',amount: 30000};const secretKey = config.secretKey;const keys = Object.keys(params);keys.sort();let toSign = "";for (let i = 0; i < keys.length; i++) {let key = keys[i];toSign += key + params[key];}const signature = crypto.createHmac("sha256", secretKey).update(toSign).digest("hex");const body = {...params,s: signature};const encodedBody = querystring.stringify(body);axios.post(`${config.apiUrl}/payment/create`, encodedBody).then((response) => console.log("checkout url", `${response.data.url}?token=${response.data.token}`)).catch((error) => console.error(error));

Lo primero que debe hacer es crear un directorio para su proyecto

mkdir flow-pythoncd flow-python

Instale dependencias necesarias

pip install requests python-dotenv

Luego cree un archivo .env para sus variables de entorno

[project_path]/.env

API_KEY=SECRET_KEY=

Luego cree un archivo main.py, importe las dependencias necesarias y cargue sus variables de entorno de la siguiente manera

import hashlibimport hmacimport osimport requestsimport uuidfrom urllib.parse import urlencodefrom dotenv import load_dotenvload_dotenv()config = {"api_url": "https://sandbox.flow.cl/api","api_key": os.getenv("API_KEY"),"secret_key": os.getenv("SECRET_KEY")}

Cree un objeto con los parámetros requeridos por el servicio payment/create

params = {"apiKey": config["api_key"],"commerceOrder": str(uuid.uuid4()),"urlConfirmation": "https://mydomain.com/confirmation","urlReturn": "https://mydomain.com/payment-status","email": "juanperez123@gmail.com","subject": "Compra de articulos en tienda online","amount": 30000}

Una vez con el objeto de los parámetros listo, usted debe generar la firma y agregarla de la siguiente manera

sorted_params = sorted(params.items(), key=lambda x: x[0])to_sign = "".join([f"{key}{value}" for key, value in sorted_params])signature = hmac.new(config["secret_key"].encode(), to_sign.encode(), hashlib.sha256).hexdigest()params["s"] = signature

Una vez con el objeto listo, debe transformarlo a formato url encoded y hacer la petición https, con los datos creados de la siguiente manera:

encoded_body = urlencode(params)response = requests.post(f"{config['api_url']}/payment/create", data=encoded_body,headers={'Content-Type':'application/x-www-form-urlencoded'})if response.status_code == 200:  data = response.json()  print("Checkout URL:", f"{data['url']}?token={data['token']}")else:  print("Error:", response.text)

Una vez el llamado a la api resuelva la respuesta, abra el navegador en la url logeada y podra ver el checkout de flow donde podra pagar la orden generada

Vea script completoimport hashlibimport hmacimport osimport requestsimport uuidfrom urllib.parse import urlencodefrom dotenv import load_dotenvload_dotenv()config = {"api_url": "https://sandbox.flow.cl/api","api_key": os.getenv("API_KEY"),"secret_key": os.getenv("SECRET_KEY")}params = {"apiKey": config["api_key"],"commerceOrder": str(uuid.uuid4()),"urlConfirmation": "https://mydomain.com/confirmation","urlReturn": "https://mydomain.com/payment-status","email": "juanperez123@gmail.com","subject": "Compra de articulos en tienda online","amount": 30000}sorted_params = sorted(params.items(), key=lambda x: x[0])to_sign = "".join([f"{key}{value}" for key, value in sorted_params])signature = hmac.new(config["secret_key"].encode(), to_sign.encode(), hashlib.sha256).hexdigest()params["s"] = signatureencoded_body = urlencode(params)response = requests.post(f"{config['api_url']}/payment/create", data=encoded_body,headers={'Content-Type':'application/x-www-form-urlencoded'})if response.status_code == 200:  data = response.json()  print("Checkout URL:", f"{data['url']}?token={data['token']}")else:  print("Error:", response.text)

---

## Liquidaciones

> Fuente: https://developers.flow.cl/docs/settlement

- 

- Liquidaciones

### LiquidacionesEl siguiente instructivo le ayudara saber el detalle de las liquidaciones de su comercio, al igual que todos los servicios de flow debe tener sus credenciales y poder firmar los parámetros de consulta del body.

El siguiente ejemplo muestra como obtener las liquidaciones en un rango de tiempo dado, para ello debe enviar los siguientes parámetros como query parameters en el endpoint settlement/search

apiKeyrequired

string

 apiKey del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">apiKey del comercio

startDaterequired

string <yyyy-mm-dd> 

 Fecha inicio de rango

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha inicio de rango

endDaterequired

string <yyyy-mm-dd> 

 Fecha fin de rango

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha fin de rango

currencystring

 Moneda de liquidación

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Moneda de liquidación

enterprisestring

 Tipo empresa:

- R: Regulada

- N: No regulada

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Tipo empresa:

- R: Regulada

- N: No regulada

srequired

string

 la firma de los parámetros efectuada con su secretKey.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">la firma de los parámetros efectuada con su secretKey.

Copy

{
- "apiKey": "string",

- "startDate": "string",

- "endDate": "string",

- "currency": "string",

- "enterprise": "string",

- "s": "string"

}

La respuesta tendrá el siguiente formato

idnumber

 Identificador de la liquidación

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador de la liquidación

datestring <yyyy-mm-dd> 

 fecha de la liquidación

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">fecha de la liquidación

taxIdstring

 Identificador tributario

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador tributario

namestring

 Nombre del usuario de la cuenta Flow

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Nombre del usuario de la cuenta Flow

emailstring

 cuenta de email del usuario de Flow

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">cuenta de email del usuario de Flow

currencystring

 Moneda de liquidación

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Moneda de liquidación

initial_balancenumber

 Saldo inicial

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Saldo inicial

final_balancenumber

 Saldo final

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Saldo final

transferrednumber

 Total a depositar

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Total a depositar

billednumber

 Monto neto a facturar

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Monto neto a facturar

enterprisestring

 Tipo empresa:

- R: Regulada

- N: No regulada

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Tipo empresa:

- R: Regulada

- N: No regulada

Copy

{
- "id": 1001,

- "date": "2018-06-15",

- "taxId": "9999999-9",

- "name": "John Doe",

- "email": "johndoe@flow.cl",

- "currency": "CLP",

- "initial_balance": 0,

- "final_balance": 0,

- "transferred": 0,

- "billed": 0,

- "enterprise": "N"

}

Para obtener mas detalle sobre la liquidación como por ejemplo los detalles de cada transferencia a abonar, puede usar el endpoint settlement/getByIdv2 y enviar los siguientes parámetros como query params.

apiKeyrequired

string

 apiKey del comercio.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">apiKey del comercio.

idrequired

string

 Identificador de la liquidación.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador de la liquidación.

srequired

string

 la firma de los parámetros efectuada con su secretKey.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">la firma de los parámetros efectuada con su secretKey.

Copy

{
- "apiKey": "string",

- "id": "string",

- "s": "string"

}

La respuesta tendrá el siguiente formato.

idnumber

 Identificador de la liquidación

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador de la liquidación

datestring <yyyy-mm-dd> 

 fecha de la liquidación

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">fecha de la liquidación

taxIdstring

 Identificador tributario

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador tributario

namestring

 Nombre del usuario de la cuenta Flow

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Nombre del usuario de la cuenta Flow

emailstring

 cuenta de email del usuario de Flow

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">cuenta de email del usuario de Flow

currencystring

 Moneda de liquidación

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Moneda de liquidación

initial_balancenumber

 Saldo inicial

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Saldo inicial

final_balancenumber

 Saldo final

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Saldo final

transferrednumber

 Total a depositar

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Total a depositar

billednumber

 Monto neto a facturar

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Monto neto a facturar

enterprisestring

 Tipo empresa:

- R: Regulada

- N: No regulada

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Tipo empresa:

- R: Regulada

- N: No regulada

summary

object

detail

object

Copy

 Expand all  Collapse all 

{
- "id": 1001,

- "date": "2018-06-15",

- "taxId": "9999999-9",

- "name": "John Doe",

- "email": "johndoe@flow.cl",

- "currency": "CLP",

- "initial_balance": 0,

- "final_balance": 0,

- "transferred": 0,

- "billed": 0,

- "enterprise": "N",

- "summary": {
- "transferred": [
- {
- "item": "Comisión de pagos recibidos",

- "amount": -1000,

- "taxes": -190

}

],

- "commission": [
- {
- "type": "Comisión de pagos",

- "amount": 1000,

- "taxes": 190,

- "total": 1200

}

],

- "payment": [
- {
- "paymentMethod": "Webpay",

- "brand": "Visa",

- "operations": 100,

- "amount": 2000,

- "rate": 4.19,

- "fixed": 100,

- "commission": 83.8,

- "taxes": 15.9,

- "balance": 1900.3

}

],

- "credit": [
- {
- "amount": 1000,

- "commission": 10,

- "taxes": 190,

- "balance": 1200,

- "operations": 100,

- "type": "Devolución Solicitada por el Comercio"

}

],

- "debit": [
- {
- "amount": 1000,

- "commission": 10,

- "taxes": 190,

- "balance": 1200,

- "operations": 100,

- "type": "Reembolsos"

}

],

- "billed": [
- {
- "type": "Comisiones de pagos recibidos",

- "amount": 1000,

- "taxes": 190,

- "balance": 1200

}

]

},

- "detail": {
- "payment": [
- {
- "trxId": 100,

- "date": "2020-12-01 23:01:56",

- "concept": "1 unidad de producto A",

- "paymentMethod": "Webpay",

- "amount": 2000,

- "rate": 4.19,

- "commission": 83.8,

- "taxes": 15.9,

- "balance": 1900.3

}

],

- "debit": [
- {
- "id": 100,

- "date": "2020-12-01 23:01:56",

- "concept": "Reembolso",

- "trxId": 123,

- "amount": 2000,

- "commission": 4.19,

- "taxes": 190,

- "balance": 83.8

}

],

- "credit": [
- {
- "id": 100,

- "date": "2020-12-01 23:01:56",

- "concept": "Reembolso",

- "trxId": 123,

- "amount": 2000,

- "commission": 4.19,

- "taxes": 190,

- "balance": 83.8

}

]

}

}

---

## Crear cupón

> Fuente: https://developers.flow.cl/docs/suscripciones/create-coupon

- 

- Planes de Suscripción
- Crear cupónEn esta página

### Crear cupón
Para crear un cupon se debe llamar al recurso /coupon/create mediante un método POST. El esquema de recurso es del tipo application/x-www-form-urlencoded, que debe ser indicado en el header Content-Type.

apiKeyrequired

string

 apiKey del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">apiKey del comercio

namerequired

string

 Nombre del cupón

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Nombre del cupón

percent_offnumber

 Porcentaje del cupon. Número entre 0 y 100. Permite 2 decimales con punto decimal. Ejemplo 10.2. No se agrega el signo %

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Porcentaje del cupon. Número entre 0 y 100. Permite 2 decimales con punto decimal. Ejemplo 10.2. No se agrega el signo %

currencystring

 Moneda del descuento. Solo agregue la moneda para cupones de monto.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Moneda del descuento. Solo agregue la moneda para cupones de monto.

amountnumber

 Monto del descuento

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Monto del descuento

durationnumber

 Duración del cupón:

- 1 definida

- 0 indefinida

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Duración del cupón:

- 1 definida

- 0 indefinida

timesnumber

 Si la duración del cupón es definida, este campo indica las veces de duración del cupón. Si el cupón se aplica a un cliente veces corresponderá a meses. Si l cupón se aplica a una suscripción, veces corresponderá a los períodos del Plan.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si la duración del cupón es definida, este campo indica las veces de duración del cupón. Si el cupón se aplica a un cliente veces corresponderá a meses. Si l cupón se aplica a una suscripción, veces corresponderá a los períodos del Plan.

max_redemptionsnumber

 Número de veces de aplicación del cupón.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de veces de aplicación del cupón.

expiresstring

 Fecha de expiración del cupón en formato yyyy-mm-dd

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de expiración del cupón en formato yyyy-mm-dd

srequired

string

 la firma de los parámetros efectuada con su secretKey.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">la firma de los parámetros efectuada con su secretKey.

Copy

{
- "apiKey": "string",

- "name": "string",

- "percent_off": 0,

- "currency": "string",

- "amount": 0,

- "duration": 0,

- "times": 0,

- "max_redemptions": 0,

- "expires": "string",

- "s": "string"

}

### Firma de parámetros​
Ejemplos de firmado de parámetros en diferentes lenguajes de programación
- PHP
- NodeJS
- Phyton$secretKey = 'my secret'$params = array('apiKey' => '1F90971E-8276-4715-97FF-2BLG5030EE3B','token' => 'AJ089FF5467367');$keys = array_keys($params);sort($keys);$toSign = '';foreach($keys as $key) {$toSign .= $key . $params[$key];};$signature = hash_hmac('sha256', $toSign , $secretKey);

const {createHmac} = require("node:crypto")const secretKey = "my secret";const params = {  apiKey: "1F90971E-8276-4715-97FF-2BLG5030EE3B",  token: "AJ089FF5467367",};const keys = Object.keys(params);keys.sort();let toSign = "";for (let i = 0; i < keys.length; i++) {  let key = keys[i];  toSign += key + params[key];}const signature = createHmac("sha256",secretKey).update(toSign).digest("hex")

import hmacimport hashlibsecret_keyparams = {'apiKey': '1F90971E-8276-4715-97FF-2BLG5030EE3B','token': 'AJ089FF5467367'}keys = list(params.keys())keys.sort()to_sign = ''for key in keys:    to_sign += key + params[key]    signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()

El servicio retorna el objeto cupon creado.

idnumber

 El identificador del cupón

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El identificador del cupón

namestring

 El nombre del cupón

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El nombre del cupón

percent_offnumber

 Si el cupón es del tipo porcentaje, en este campo indica el porcentaje de descuento, sino, muestra vacío.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si el cupón es del tipo porcentaje, en este campo indica el porcentaje de descuento, sino, muestra vacío.

currencystring

 Si el cupón es del tipo monto, aquí va la moneda, sino, muestra vacío

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si el cupón es del tipo monto, aquí va la moneda, sino, muestra vacío

amountnumber

 Si el cupón es del tipo monto, aquí va el monto de descuento, sino, muestra vacío

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si el cupón es del tipo monto, aquí va el monto de descuento, sino, muestra vacío

createdstring

 La fecha de creación del cupón

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">La fecha de creación del cupón

durationnumber

 Si el cupón es de duración indefinida = 0, o es de duración definida = 1 

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si el cupón es de duración indefinida = 0, o es de duración definida = 1 

timesnumber

 Si el cupón es de duración definida, en este campo va el número de veces de duración. Si el cupón es aplicado a un cliente, el número de duración equivale a meses, si el cupón es aplicado a una suscripción, el número de duración será los períodos del plan de suscripción

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si el cupón es de duración definida, en este campo va el número de veces de duración. Si el cupón es aplicado a un cliente, el número de duración equivale a meses, si el cupón es aplicado a una suscripción, el número de duración será los períodos del plan de suscripción

max_redemptionsnumber

 Es el número de veces que puede ser aplicado este cupón, ya sea a clientes o a suscripciones. Una vez que se completa el número de veces, ya no queda disponible para ser aplicado.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Es el número de veces que puede ser aplicado este cupón, ya sea a clientes o a suscripciones. Una vez que se completa el número de veces, ya no queda disponible para ser aplicado.

expiresstring <yyyy-mm-dd hh:mm.ss> 

 Si el cupón se creó con fecha de expiración aquí va la fecha.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si el cupón se creó con fecha de expiración aquí va la fecha.

statusnumber

 El estado del cupón, Activo = 1, Inactivo = 0

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El estado del cupón, Activo = 1, Inactivo = 0

redemtionsnumber

 El número de veces que se ha aplicado este cupón

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El número de veces que se ha aplicado este cupón

Copy

{
- "id": 166,

- "name": 166,

- "percent_off": 10,

- "currency": "CLP",

- "amount": 2000,

- "created": "2018-07-13 09:57:53",

- "duration": 1,

- "times": 1,

- "max_redemptions": 50,

- "expires": "2018-12-31 00:00:00",

- "status": 1,

- "redemtions": 21

}

---

## Crear un cliente

> Fuente: https://developers.flow.cl/docs/suscripciones/create-customer

- 

- Planes de Suscripción
- Crear un clienteEn esta página

### Crear un cliente
Es necesario crear el cliente que se suscribirá al plan. Esta acción puede realizarse tanto desde el portal de Flow como a través de la API.

Si se utiliza la API, se debe llamar al recurso /customer/create mediante un método POST, el cual devolverá el customerId del nuevo cliente. El esquema de recurso es del tipo application/x-www-form-urlencoded, que debe ser indicado en el header Content-Type.

apiKeyrequired

string

 apiKey del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">apiKey del comercio

namerequired

string

 Nombre del cliente (nombre y apellido)

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Nombre del cliente (nombre y apellido)

emailrequired

string

 Email del cliente

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Email del cliente

externalIdrequired

string

 Identificador externo del cliente, es decir, el identificador con el que su sistema lo reconoce.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador externo del cliente, es decir, el identificador con el que su sistema lo reconoce.

srequired

string

 la firma de los parámetros efectuada con su secretKey

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">la firma de los parámetros efectuada con su secretKey

Copy

{
- "apiKey": "string",

- "name": "string",

- "email": "string",

- "externalId": "string",

- "s": "string"

}

### Firma de parámetros​
Ejemplos de firmado de parámetros en diferentes lenguajes de programación
- PHP
- NodeJS
- Phyton$secretKey = 'my secret'$params = array('apiKey' => '1F90971E-8276-4715-97FF-2BLG5030EE3B','token' => 'AJ089FF5467367');$keys = array_keys($params);sort($keys);$toSign = '';foreach($keys as $key) {$toSign .= $key . $params[$key];};$signature = hash_hmac('sha256', $toSign , $secretKey);

const {createHmac} = require("node:crypto")const secretKey = "my secret";const params = {  apiKey: "1F90971E-8276-4715-97FF-2BLG5030EE3B",  token: "AJ089FF5467367",};const keys = Object.keys(params);keys.sort();let toSign = "";for (let i = 0; i < keys.length; i++) {  let key = keys[i];  toSign += key + params[key];}const signature = createHmac("sha256",secretKey).update(toSign).digest("hex")

import hmacimport hashlibsecret_keyparams = {'apiKey': '1F90971E-8276-4715-97FF-2BLG5030EE3B','token': 'AJ089FF5467367'}keys = list(params.keys())keys.sort()to_sign = ''for key in keys:    to_sign += key + params[key]    signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()

El servicio retorna el objeto cliente creado.

customerIdstring

 Identificador del cliente

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador del cliente

createdstring <yyyy-mm-dd hh:mm:ss> 

 La fecha de creación

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">La fecha de creación

emailstring

 email del cliente

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">email del cliente

namestring

 nombre del cliente

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">nombre del cliente

pay_modestring

 modo de pago del cliente:

- auto (cargo automático)

- manual (cobro manual)

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">modo de pago del cliente:

- auto (cargo automático)

- manual (cobro manual)

creditCardTypestring

 La marca de la tarjeta de crédito registrada

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">La marca de la tarjeta de crédito registrada

last4CardDigitsstring

 Los últimos 4 dígitos de la tarjeta de crédito registrada

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Los últimos 4 dígitos de la tarjeta de crédito registrada

externalIdstring

 El identificador del cliente en su negocio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El identificador del cliente en su negocio

statusstring

 El estado del cliente: 

- 0 Eliminado

- 1 Activo

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El estado del cliente: 

- 0 Eliminado

- 1 Activo

registerDatestring <yyyy-mm-dd hh:mm:ss> 

 La fecha en que el cliente registro su tarjeta de crédito.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">La fecha en que el cliente registro su tarjeta de crédito.

Copy

{
- "customerId": "cus_onoolldvec",

- "created": "2017-07-21 12:33:15",

- "email": "customer@gmail.com",

- "name": "Pedro Raul Perez",

- "pay_mode": "string",

- "creditCardType": "Visa",

- "last4CardDigits": "4425",

- "externalId": "14233531-8",

- "status": "1",

- "registerDate": "2017-07-21 14:22:01"

}

Luego de crear el o los clientes a suscribir, se puede Registrar tarjeta del cliente o Suscribir cliente a un plan.

---

## Crear un plan de suscripción

> Fuente: https://developers.flow.cl/docs/suscripciones/create-plan

- 

- Planes de Suscripción
- Crear un planEn esta página

### Crear un plan de suscripción
En primer lugar, el comercio debe crear uno o varios planes que desee poner a disposición de sus clientes. Estos planes pueden configurarse de manera sencilla a través del portal de Flow o mediante la API, llamando al recurso /plans/create mediante un método POST. El esquema de recurso es del tipo application/x-www-form-urlencoded, que debe ser indicado en el header Content-Type.

Además, Flow permite personalizar cada plan según las necesidades del negocio, definiendo aspectos como la duración, los montos de cobro, la frecuencia de pago y la inclusión de descuentos o períodos de prueba.

apiKeyrequired

string

 apiKey del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">apiKey del comercio

planIdrequired

string

 Identificador del Plan. Un texto identificador del Plan, sin espacios, ejemplo: PlanMensual

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador del Plan. Un texto identificador del Plan, sin espacios, ejemplo: PlanMensual

namerequired

string

 Nombre del Plan

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Nombre del Plan

currencystring

 Moneda del Plan, por omisión CLP

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Moneda del Plan, por omisión CLP

amountrequired

number

 Monto del Plan

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Monto del Plan

intervalrequired

number

 Especifica la frecuencia de cobros (generación de importe)

- 1 diario

- 2 semanal

- 3 mensual

- 4 anual

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Especifica la frecuencia de cobros (generación de importe)

- 1 diario

- 2 semanal

- 3 mensual

- 4 anual

interval_countnumber

 Número de intervalos de frecuencia de cobros, por ejemplo:

- interval = 2 y interval_count = 2 la frecuancia será quincenal. El valor por omisión es 1.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de intervalos de frecuencia de cobros, por ejemplo:

- interval = 2 y interval_count = 2 la frecuancia será quincenal. El valor por omisión es 1.

trial_period_daysnumber

 Número de días de Trial. El valor por omisón es 0.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de días de Trial. El valor por omisón es 0.

days_until_duenumber

 Número de días pasados, después de generar un importe, para considerar el importe vencido. Si no se especifica el valor será 3.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de días pasados, después de generar un importe, para considerar el importe vencido. Si no se especifica el valor será 3.

periods_numbernumber

 Número de períodos de duración del plan. Si el plan tiene vencimiento, entonces ingrese aquí el número de periodos de duración del plan

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de períodos de duración del plan. Si el plan tiene vencimiento, entonces ingrese aquí el número de periodos de duración del plan

urlCallbackstring

 URL donde Flow notificará al comercio los pagos efectuados por este plan.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">URL donde Flow notificará al comercio los pagos efectuados por este plan.

charges_retries_numbernumber

 El número de reintentos de cargo, por omisión Flow utilizará 3

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El número de reintentos de cargo, por omisión Flow utilizará 3

currency_convert_optionany

 Si hay conversión de moneda, en qué momento hará la conversión:

- 1 al pago (default)

- 2 al importe (invoice)

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si hay conversión de moneda, en qué momento hará la conversión:

- 1 al pago (default)

- 2 al importe (invoice)

srequired

string

 la firma de los parámetros efectuada con su secretKey

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">la firma de los parámetros efectuada con su secretKey

Copy

{
- "apiKey": "string",

- "planId": "string",

- "name": "string",

- "currency": "string",

- "amount": 0,

- "interval": 0,

- "interval_count": 0,

- "trial_period_days": 0,

- "days_until_due": 0,

- "periods_number": 0,

- "urlCallback": "string",

- "charges_retries_number": 0,

- "currency_convert_option": null,

- "s": "string"

}

### Firma de parámetros​
Ejemplos de firmado de parámetros en diferentes lenguajes de programación
- PHP
- NodeJS
- Phyton$secretKey = 'my secret'$params = array('apiKey' => '1F90971E-8276-4715-97FF-2BLG5030EE3B','token' => 'AJ089FF5467367');$keys = array_keys($params);sort($keys);$toSign = '';foreach($keys as $key) {$toSign .= $key . $params[$key];};$signature = hash_hmac('sha256', $toSign , $secretKey);

const {createHmac} = require("node:crypto")const secretKey = "my secret";const params = {  apiKey: "1F90971E-8276-4715-97FF-2BLG5030EE3B",  token: "AJ089FF5467367",};const keys = Object.keys(params);keys.sort();let toSign = "";for (let i = 0; i < keys.length; i++) {  let key = keys[i];  toSign += key + params[key];}const signature = createHmac("sha256",secretKey).update(toSign).digest("hex")

import hmacimport hashlibsecret_keyparams = {'apiKey': '1F90971E-8276-4715-97FF-2BLG5030EE3B','token': 'AJ089FF5467367'}keys = list(params.keys())keys.sort()to_sign = ''for key in keys:    to_sign += key + params[key]    signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()

El servicio retorna el objeto plan creado.

planIdstring

 Identificador del plan

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador del plan

namestring

 Nombre del plan

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Nombre del plan

currencystring

 Moneda del plan

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Moneda del plan

amountnumber

 Monto del plan

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Monto del plan

intervalnumber

 Define la frecuencia de cobro del plan:

- 1 diaria

- 2 semanal

- 3 mesual

- 4 anual

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Define la frecuencia de cobro del plan:

- 1 diaria

- 2 semanal

- 3 mesual

- 4 anual

interval_countnumber

 Número de intervalos de la frecuencia de cobro del plan, ejemplo:
interal = 2 y interval_count = 2 significaría un plan quincenal.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de intervalos de la frecuencia de cobro del plan, ejemplo:
interal = 2 y interval_count = 2 significaría un plan quincenal.

createdstring <yyyy-mm-dd hh:mm.ss> 

 Fecha de creación del plan

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de creación del plan

trial_period_daysnumber

 Número de días de Trial

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de días de Trial

days_until_duenumber

 Número de días pasados, después de generar un importe, para considerar el importe vencido.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de días pasados, después de generar un importe, para considerar el importe vencido.

periods_numbernumber

 Número de períodos de duración del plan. Si el plan es de término indefinido el valor de periods_number sera 0 (cero)

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de períodos de duración del plan. Si el plan es de término indefinido el valor de periods_number sera 0 (cero)

urlCallbackstring <uri> 

 URL donde Flow notificará al comercio los pagos efectuados por este plan.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">URL donde Flow notificará al comercio los pagos efectuados por este plan.

charges_retries_numbernumber

 Número de reintentos de cargo, por omisión Flow utilizará 3 reintentos.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de reintentos de cargo, por omisión Flow utilizará 3 reintentos.

currency_convert_optionnumber

 Si hay conversión de moneda, en qué momento hará la conversión:

- 1 al pago

- 2 al importe (invoice)

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si hay conversión de moneda, en qué momento hará la conversión:

- 1 al pago

- 2 al importe (invoice)

statusnumber

 El estado del plan:

- 1 activo

- 0 eliminado

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El estado del plan:

- 1 activo

- 0 eliminado

publicnumber

 Si el Plan es de visibilidad pública, es decir, expuestos a otras aplicaciones:

- 0 privado

- 1 público

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si el Plan es de visibilidad pública, es decir, expuestos a otras aplicaciones:

- 0 privado

- 1 público

Copy

{
- "planId": "myPlan01",

- "name": "Plan junior",

- "currency": "CLP",

- "amount": 20000,

- "interval": 3,

- "interval_count": 1,

- "created": "2017-07-21 12:33:15",

- "trial_period_days": 15,

- "days_until_due": 3,

- "periods_number": 12,

- "urlCallback": "https://www.comercio.cl/flow/suscriptionResult.php",

- "charges_retries_number": 3,

- "currency_convert_option": 0,

- "status": 1,

- "public": 1

}

Creado el plan lo siguiente es crear al cliente. Crear cliente.

---

## Suscribir al cliente a un plan

> Fuente: https://developers.flow.cl/docs/suscripciones/create-suscription

- 

- Planes de Suscripción
- Crear una suscripciónEn esta página

### Suscribir al cliente a un plan
Para crear una suscripción se debe llamar al recurso /subscription/create mediante un método POST. El esquema de recurso es del tipo application/x-www-form-urlencoded, que debe ser indicado en el header Content-Type.

Para crear una nueva suscripción, basta con enviar los parámetros planId y customerId.

Cupón

En caso que existiera un cupón de descuento, puede agregarse aquí mediante su couponId. Para mas informacion sobre como crear un cupón, consulte la seccion Crear cupón.

apiKeyrequired

string

 apiKey del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">apiKey del comercio

planIdrequired

string

 Identificador del Plan

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador del Plan

customerIdrequired

string

 Identificador del cliente

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador del cliente

subscription_startstring <yyyy-mm-dd> 

 La fecha de inicio de la suscripción

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">La fecha de inicio de la suscripción

couponIdnumber

 Si quiere aplicarle un descuento, el identificador del cupón de descuento.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si quiere aplicarle un descuento, el identificador del cupón de descuento.

trial_period_daysnumber

 Número de días de Trial. Si el Plan tiene días de Trial, este valor modificará los días para esta suscripción.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de días de Trial. Si el Plan tiene días de Trial, este valor modificará los días para esta suscripción.

periods_numbernumber

 Número de períodos de duración de la subscripción. Si null, entonces tomará el periods_number del plan.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de períodos de duración de la subscripción. Si null, entonces tomará el periods_number del plan.

srequired

string

 la firma de los parámetros efectuada con su secretKey

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">la firma de los parámetros efectuada con su secretKey

Copy

{
- "apiKey": "string",

- "planId": "string",

- "customerId": "string",

- "subscription_start": "string",

- "couponId": 0,

- "trial_period_days": 0,

- "periods_number": 0,

- "s": "string"

}

### Firma de parámetros​
Ejemplos de firmado de parámetros en diferentes lenguajes de programación
- PHP
- NodeJS
- Phyton$secretKey = 'my secret'$params = array('apiKey' => '1F90971E-8276-4715-97FF-2BLG5030EE3B','token' => 'AJ089FF5467367');$keys = array_keys($params);sort($keys);$toSign = '';foreach($keys as $key) {$toSign .= $key . $params[$key];};$signature = hash_hmac('sha256', $toSign , $secretKey);

const {createHmac} = require("node:crypto")const secretKey = "my secret";const params = {  apiKey: "1F90971E-8276-4715-97FF-2BLG5030EE3B",  token: "AJ089FF5467367",};const keys = Object.keys(params);keys.sort();let toSign = "";for (let i = 0; i < keys.length; i++) {  let key = keys[i];  toSign += key + params[key];}const signature = createHmac("sha256",secretKey).update(toSign).digest("hex")

import hmacimport hashlibsecret_keyparams = {'apiKey': '1F90971E-8276-4715-97FF-2BLG5030EE3B','token': 'AJ089FF5467367'}keys = list(params.keys())keys.sort()to_sign = ''for key in keys:    to_sign += key + params[key]    signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()

El servicio retorna el objeto suscripcion creada.

subscriptionIdstring

 Identificador de la suscripción

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador de la suscripción

planIdstring

 Identificador del plan

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador del plan

plan_namestring

 Nombre del plan

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Nombre del plan

customerIdstring

 Identificador del cliente

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador del cliente

createdstring <yyyy-mm-dd hh:mm.ss> 

 Fecha de creación de la suscripción

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de creación de la suscripción

subscription_startstring <yyyy-mm-dd hh:mm.ss> 

 Fecha de inicio de la suscripción

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de inicio de la suscripción

subscription_endstring <yyyy-mm-dd hh:mm:ss> 

 Fecha de término de la suscripción, si la suscripción no tiene término mostrará valor null.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de término de la suscripción, si la suscripción no tiene término mostrará valor null.

period_startstring <yyyy-mm-dd hh:mm.ss> 

 Fecha de inicio del período actual.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de inicio del período actual.

period_endstring <yyyy-mm-dd hh:mm.ss> 

 Fecha de término del período actual.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de término del período actual.

next_invoice_datestring <yyyy-mm-dd hh:mm.ss> 

 Fecha del siguiente cobro

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha del siguiente cobro

trial_period_daysnumber

 Número de días de Trial

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de días de Trial

trial_startstring <yyyy-mm-dd hh:mm.ss> 

 Fecha de inicio del trial

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de inicio del trial

trial_endstring <yyyy-mm-dd hh:mm.ss> 

 Fecha de término del trial.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de término del trial.

cancel_at_period_endnumber

 Si la suscripción será cancelada automáticamente al finalizar el período actual:

- 0 No

- 1 Si

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si la suscripción será cancelada automáticamente al finalizar el período actual:

- 0 No

- 1 Si

cancel_atstring

 Fecha de cancelación de la suscripción

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de cancelación de la suscripción

periods_numbernumber

 Número de períodos de vigencia de la suscripción

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de períodos de vigencia de la suscripción

days_until_duenumber

 Número de días pasados, después de generar un importe, para considerar el importe vencido.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de días pasados, después de generar un importe, para considerar el importe vencido.

statusnumber

 Estado de la suscripción:

- 0 Inactivo (no iniciada)

- 1 Activa

- 2 En período de trial

- 4 Cancelada

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Estado de la suscripción:

- 0 Inactivo (no iniciada)

- 1 Activa

- 2 En período de trial

- 4 Cancelada

discount_balancestring

 Monto de balance a favor en la suscripción

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Monto de balance a favor en la suscripción

newPlanIdnumber

 Id del nuevo plan programado a cambiarse

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Id del nuevo plan programado a cambiarse

new_plan_scheduled_change_datestring

 Fecha de cambio de plan programado

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de cambio de plan programado

in_new_plan_next_attempt_datestring

 Fecha de proximo intento de cambio de plan

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de proximo intento de cambio de plan

morosenumber

 Si la subscripción está morosa:

- 0 si todos los invoices está pagados.

- 1 si uno o más invoices están vencidos.

- 2 si uno o más invoices están pendiente de pago, pero no vencidos.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si la subscripción está morosa:

- 0 si todos los invoices está pagados.

- 1 si uno o más invoices están vencidos.

- 2 si uno o más invoices están pendiente de pago, pero no vencidos.

discount

object (Discount) 

 Descuento aplicado a una Suscripción

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Descuento aplicado a una Suscripción

invoices

Array of objects (Invoice) 

 Lista de los importe efectuados a la suscripción.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Lista de los importe efectuados a la suscripción.

planAdditionalListArray of objects

 Lista de adicionales asociados a la suscripción.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Lista de adicionales asociados a la suscripción.

Copy

 Expand all  Collapse all 

{
- "subscriptionId": "sus_azcyjj9ycd",

- "planId": "MiPlanMensual",

- "plan_name": "Plan mensual",

- "customerId": "cus_eblcbsua2g",

- "created": "2018-06-26 17:29:06",

- "subscription_start": "2018-06-26 17:29:06",

- "subscription_end": "2019-06-25 00:00:00",

- "period_start": "2018-06-26 00:00:00",

- "period_end": "2018-06-26 00:00:00",

- "next_invoice_date": "2018-06-27 00:00:00",

- "trial_period_days": 1,

- "trial_start": "2018-06-26 00:00:00",

- "trial_end": "2018-06-26 00:00:00",

- "cancel_at_period_end": 0,

- "cancel_at": null,

- "periods_number": 12,

- "days_until_due": 3,

- "status": 1,

- "discount_balance": "20000.0000",

- "newPlanId": 12,

- "new_plan_scheduled_change_date": null,

- "in_new_plan_next_attempt_date": null,

- "morose": 0,

- "discount": {
- "id": 181,

- "type": "Subscription discount",

- "created": "2019-12-01 00:00:00",

- "start": "2019-12-01 00:00:00",

- "end": "2019-12-31 00:00:00",

- "deleted": "2019-12-25 00:00:00",

- "status": 1,

- "coupon": {
- "id": 166,

- "name": 166,

- "percent_off": 10,

- "currency": "CLP",

- "amount": 2000,

- "created": "2018-07-13 09:57:53",

- "duration": 1,

- "times": 1,

- "max_redemptions": 50,

- "expires": "2018-12-31 00:00:00",

- "status": 1,

- "redemtions": 21

}

},

- "invoices": [
- {
- "id": 1034,

- "subscriptionId": "sus_azcyjj9ycd",

- "customerId": "cus_eblcbsua2g",

- "created": "2018-06-26 17:29:06",

- "subject": "PlanPesos - período 2018-06-27 / 2018-06-27",

- "currency": "CLP",

- "amount": 20000,

- "period_start": "2018-06-27 00:00:00",

- "period_end": "2018-07-26 00:00:00",

- "attemp_count": 0,

- "attemped": 1,

- "next_attemp_date": "2018-07-27 00:00:00",

- "due_date": "2018-06-30 00:00:00",

- "status": 0,

- "error": 0,

- "errorDate": "2018-06-30 00:00:00",

- "errorDescription": "The minimum amount is 350 CLP",

- "items": [
- {
- "id": 567,

- "subject": "PlanPesos - período 2018-06-27 / 2018-06-27",

- "type": 1,

- "currency": "CLP",

- "amount": 20000

}

],

- "payment": {
- "flowOrder": 3567899,

- "commerceOrder": "sf12377",

- "requestDate": "2017-07-21 12:32:11",

- "status": 1,

- "subject": "game console",

- "currency": "CLP",

- "amount": 12000,

- "payer": "pperez@gamil.com",

- "optional": {
- "RUT": "7025521-9",

- "ID": "899564778"

},

- "pending_info": {
- "media": "Multicaja",

- "date": "2017-07-21 10:30:12"

},

- "paymentData": {
- "date": "2017-07-21 12:32:11",

- "media": "webpay",

- "conversionDate": "2017-07-21",

- "conversionRate": 1.1,

- "amount": 12000,

- "currency": "CLP",

- "fee": 551,

- "balance": 11499,

- "transferDate": "2017-07-24"

},

- "merchantId": "string"

},

- "outsidePayment": {
- "date": "2021-03-08 00:00:00",

- "comment": "Pago por caja"

},

- "paymentLink": "https://www.flow.cl/app/web/pay.php?token=7C18C35358FEF0E33C056C719E94956D4FC9BBEL",

- "chargeAttemps": [
- {
- "id": 901,

- "date": "2018-12-06 15:03:33",

- "customerId": "cus_1uqfm95dch",

- "invoiceId": 1234,

- "commerceOrder": "1883",

- "currency": "CLP",

- "amount": 90000,

- "errorCode": 1605,

- "errorDescription": "This commerceOrder 1883 has been previously paid"

}

]

}

],

- "planAdditionalList": [
- {
- "s_item_id": 3,

- "item_id": 1,

- "sub_id": 421527,

- "name": "Test",

- "currency": "CLP",

- "amount": 500,

- "created_at": "2019-09-26 14:12:41",

- "updated_at": "2019-09-26 14:12:41",

- "completeAmountFormat": "$ 500 CLP",

- "amountFormat": "500",

- "adjustmentTypeLabel": "Aumenta"

},

- {
- "s_item_id": 4,

- "item_id": 2,

- "sub_id": 421527,

- "name": "Test 2",

- "currency": "CLP",

- "amount": 500,

- "created_at": "2019-09-26 14:15:41",

- "updated_at": "2019-09-26 14:15:41",

- "completeAmountFormat": "$ 500 CLP",

- "amountFormat": "500",

- "adjustmentTypeLabel": "Aumenta"

},

- {
- "s_item_id": 5,

- "item_id": 3,

- "sub_id": 421527,

- "name": "Test 14",

- "currency": "CLP",

- "amount": 500,

- "created_at": "2019-09-26 14:16:41",

- "updated_at": "2019-09-26 14:16:41",

- "completeAmountFormat": "$ 500 CLP",

- "amountFormat": "500",

- "adjustmentTypeLabel": "Aumenta"

}

]

}

Una vez creada la suscripcion la misma generara los importes, para mas informacion sobre como obtenerlos consulte la sección Importes

---

## Obtener factura

> Fuente: https://developers.flow.cl/docs/suscripciones/get-invoice

- 

- Planes de Suscripción
- Obtener facturaEn esta página

### Obtener factura
Para obtener una factura se debe llamar al recurso /invoice/get mediante un método GET.

apiKeyrequired

string

 apiKey del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">apiKey del comercio

invoiceIdrequired

number

 Identificador del Invoice

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador del Invoice

srequired

string

 La firma de los parámetros efectuada con su secretKey.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">La firma de los parámetros efectuada con su secretKey.

Copy

{
- "apiKey": "string",

- "invoiceId": 0,

- "s": "string"

}

### Firma de parámetros​
Ejemplos de firmado de parámetros en diferentes lenguajes de programación
- PHP
- NodeJS
- Phyton$secretKey = 'my secret'$params = array('apiKey' => '1F90971E-8276-4715-97FF-2BLG5030EE3B','token' => 'AJ089FF5467367');$keys = array_keys($params);sort($keys);$toSign = '';foreach($keys as $key) {$toSign .= $key . $params[$key];};$signature = hash_hmac('sha256', $toSign , $secretKey);

const {createHmac} = require("node:crypto")const secretKey = "my secret";const params = {  apiKey: "1F90971E-8276-4715-97FF-2BLG5030EE3B",  token: "AJ089FF5467367",};const keys = Object.keys(params);keys.sort();let toSign = "";for (let i = 0; i < keys.length; i++) {  let key = keys[i];  toSign += key + params[key];}const signature = createHmac("sha256",secretKey).update(toSign).digest("hex")

import hmacimport hashlibsecret_keyparams = {'apiKey': '1F90971E-8276-4715-97FF-2BLG5030EE3B','token': 'AJ089FF5467367'}keys = list(params.keys())keys.sort()to_sign = ''for key in keys:    to_sign += key + params[key]    signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()

El servicio retorna el objeto invoice.

idnumber

 Identificador del importe

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador del importe

subscriptionIdstring

 Identificador de la suscripción

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador de la suscripción

customerIdstring

 Identificador del cliente

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador del cliente

createdstring <yyyy-mm-dd hh:mm.ss> 

 Fecha de creación del importe

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de creación del importe

subjectstring

 Descripción del importe

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Descripción del importe

currencystring

 Moneda del importe

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Moneda del importe

amountnumber

 Monto del importe

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Monto del importe

period_startstring <yyyy-mm-dd hh:mm.ss> 

 Fecha de inicio del período del importe

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de inicio del período del importe

period_endstring <yyyy-mm-dd hh:mm.ss> 

 Fecha de término del período del importe

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de término del período del importe

attemp_countinteger

 Número de intentos de cobro del importe

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de intentos de cobro del importe

attempedinteger

 Si este importe se cobrará:

- 1 Se cobrará

- 0 No se cobrará

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si este importe se cobrará:

- 1 Se cobrará

- 0 No se cobrará

next_attemp_datestring <yyyy-mm-dd hh:mm.ss> 

 Fecha del siguiente intento de cobro

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha del siguiente intento de cobro

due_datestring <yyyy-mm-dd hh:mm.ss> 

 Fecha en que este importe será considerado moroso

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha en que este importe será considerado moroso

statusinteger

 Estado del importe:

- 0 impago

- 1 pagado

- 2 anulado

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Estado del importe:

- 0 impago

- 1 pagado

- 2 anulado

errorinteger

 Si se produjo un error al intentar cobrar el invoice:

- 0 Sin error

- 1 Con error

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Si se produjo un error al intentar cobrar el invoice:

- 0 Sin error

- 1 Con error

errorDatestring <yyyy-mm-dd hh:mm.ss> 

 Fecha en que se produjo el error o null si no hay error

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha en que se produjo el error o null si no hay error

errorDescriptionstring

 Descripción de error o null si no hay error

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Descripción de error o null si no hay error

items

Array of objects (InvoiceItem) 

 Items del invoice

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Items del invoice

payment

object or null (PaymentStatus) 

 Objeto que representa un cobro y si está pagado su correspondiente pago

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Objeto que representa un cobro y si está pagado su correspondiente pago

outsidePayment

object or null (OutsidePayment) 

 Objeto que muestra los datos de un pago por fuera

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Objeto que muestra los datos de un pago por fuera

paymentLinkstring

 Link de pago. Cuando el invoice no esta pagado

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Link de pago. Cuando el invoice no esta pagado

chargeAttemps

Array of objects (ChargeAttemps) 

 Intentos de cargo fallidos

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Intentos de cargo fallidos

Copy

 Expand all  Collapse all 

{
- "id": 1034,

- "subscriptionId": "sus_azcyjj9ycd",

- "customerId": "cus_eblcbsua2g",

- "created": "2018-06-26 17:29:06",

- "subject": "PlanPesos - período 2018-06-27 / 2018-06-27",

- "currency": "CLP",

- "amount": 20000,

- "period_start": "2018-06-27 00:00:00",

- "period_end": "2018-07-26 00:00:00",

- "attemp_count": 0,

- "attemped": 1,

- "next_attemp_date": "2018-07-27 00:00:00",

- "due_date": "2018-06-30 00:00:00",

- "status": 0,

- "error": 0,

- "errorDate": "2018-06-30 00:00:00",

- "errorDescription": "The minimum amount is 350 CLP",

- "items": [
- {
- "id": 567,

- "subject": "PlanPesos - período 2018-06-27 / 2018-06-27",

- "type": 1,

- "currency": "CLP",

- "amount": 20000

}

],

- "payment": {
- "flowOrder": 3567899,

- "commerceOrder": "sf12377",

- "requestDate": "2017-07-21 12:32:11",

- "status": 1,

- "subject": "game console",

- "currency": "CLP",

- "amount": 12000,

- "payer": "pperez@gamil.com",

- "optional": {
- "RUT": "7025521-9",

- "ID": "899564778"

},

- "pending_info": {
- "media": "Multicaja",

- "date": "2017-07-21 10:30:12"

},

- "paymentData": {
- "date": "2017-07-21 12:32:11",

- "media": "webpay",

- "conversionDate": "2017-07-21",

- "conversionRate": 1.1,

- "amount": 12000,

- "currency": "CLP",

- "fee": 551,

- "balance": 11499,

- "transferDate": "2017-07-24"

},

- "merchantId": "string"

},

- "outsidePayment": {
- "date": "2021-03-08 00:00:00",

- "comment": "Pago por caja"

},

- "paymentLink": "https://www.flow.cl/app/web/pay.php?token=7C18C35358FEF0E33C056C719E94956D4FC9BBEL",

- "chargeAttemps": [
- {
- "id": 901,

- "date": "2018-12-06 15:03:33",

- "customerId": "cus_1uqfm95dch",

- "invoiceId": 1234,

- "commerceOrder": "1883",

- "currency": "CLP",

- "amount": 90000,

- "errorCode": 1605,

- "errorDescription": "This commerceOrder 1883 has been previously paid"

}

]

}

---

## Flujo de integración

> Fuente: https://developers.flow.cl/docs/suscripciones/integration-flow

- 

- Planes de Suscripción
- Flujo de integración

### Flujo de integración

- Crear un plan
El comercio define los planes de suscripción con montos, frecuencia de pago y posibles descuentos desde el portal de Flow o la API.

- Crear un cliente
Se registra al cliente en Flow, obteniendo un identificador único.

- Registro de Tarjeta
El cliente ingresa su tarjeta mediante redirección, un widget en la web o un enlace por correo.

- Consultar estado de suscripción
Se consulta si el registro fue exitoso y la tarjeta está activa.

- Suscribir cliente a un plan
Finalmente, el cliente se asocia a un plan y los cobros se procesan automáticamente.

---

## Registrar tarjeta

> Fuente: https://developers.flow.cl/docs/suscripciones/register-card

- 

- Planes de Suscripción
- Registrar tarjeta

### Registrar tarjeta
Se debe invocar él método /customer/register con el customerId del cliente creado. Este método responderá un endpoint y token.

Si desea realizar una suscripción, existen tres alternativas para registrar tarjeta al cliente:

- 
Enrolar utilizando redirección

Redirecciona al endpoint y token que responde el servicio

- 
Enrolar utilizando Widget

Con el token se debe embeber el widget de suscripción, incrustando el siguiente código de javascript en el front de cara al cliente.

Se debe considerar el ambiente que se está utilizando.

Sandbox: https://sandbox.flow.cl

Producción: https://www.flow.cl

El valor del token en el código se debe incluir con la siguiente variable {$token}

Código:

<form id="formSubscribe" action="/" method="POST">  <input type="hidden" id="token" name="token" value="{$token}" >  <div id="subscribe-container" style="height: 250px;"></div></form><script src="https://sandbox.flow.cl/app/elements/flow-1.1.0.min.js?20241202"></script><script>  document.addEventListener("DOMContentLoaded", function () {    var flow = Flow();    var elements = flow.elements();    var token = document.getElementById("token").value;    console.log("Token obtenido:", token);    var subscribe = elements.create('subscribe', {      style: {        backgroundColor: "#f8f9fa"      }    });    console.log("Objeto subscribe:", subscribe);    subscribe.mount('#subscribe-container', token);    var form = document.getElementById("formSubscribe");    flow.handleCardSubscribed(subscribe)    .then(function (data) {      console.log("Pago procesado correctamente:", data);      setTimeout(function () {        console.log("Enviando formulario...");        form.submit();      }, 3000);    })    .catch(function (error) {      console.error("Error en el pago:", error);    });  });</script>

- Enrolar enviando correo
Para invitar a un cliente a enrolar su tarjeta por correo, debes hacerlo desde el portal de clientes.

Si creas el cliente directamente en el portal, aparecerá un modal preguntando si deseas que Flow le envíe un correo. Al aceptar, el cliente recibirá un correo con instrucciones para enrolar su tarjeta de forma segura.

---

## Consultar el estado de la suscripción

> Fuente: https://developers.flow.cl/docs/suscripciones/suscription-status

- 

- Planes de Suscripción
- Estado suscripción

### Consultar el estado de la suscripción
El formSubscribe envía un POST que recibe de respuesta el token de suscripción. Con este token se debe invocar el método /customer/getRegisterStatus para obtener el status de la suscripción y el customerId del cliente.

---

## Crear una orden de pago

> Fuente: https://developers.flow.cl/docs/tutorial-basics/create-order

- 

- Pago Ecommerce
- Creación de ordenEn esta página

### Crear una orden de pago
Aprende de inicio a fin como recibir los pagos de tus clientes.

### Enviar datos de orden​
A continuación, se detalla el método de integración al servicio de checkout de Flow utilizando la API versión 1.

El proceso inicia cuando el cliente selecciona su producto y elige pagar mediante Flow. Cuando el comercio recibe la solicitud de pago del cliente, este debe crear una orden de pago en Flow llamando al recurso /payment/create mediante un método POST. El esquema de recurso es del tipo application/x-www-form-urlencoded, que debe ser indicado en el header Content-Type

apiKeyrequired

string

 apiKey del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">apiKey del comercio

commerceOrderrequired

string

 Orden del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Orden del comercio

subjectrequired

string

 Descripción de la orden

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Descripción de la orden

currencystring

 Moneda de la orden

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Moneda de la orden

amountrequired

number

 Monto de la orden

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Monto de la orden

emailrequired

string <email> 

 email del pagador

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">email del pagador

paymentMethodinteger

 Identificador del medio de pago. Si se envía el identificador, el pagador será redireccionado directamente al medio de pago que se indique, de lo contrario Flow le presentará una página para seleccionarlo. El medio de pago debe haber sido previamente contratado. Podrá ver los identificadores de sus medios de pago en la sección &quot;Medios de pago&quot; ingresando a Flow con sus credenciales. Para indicar todos los medios de pago utilice el identificador:

- 9 Todos los medios

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador del medio de pago. Si se envía el identificador, el pagador será redireccionado directamente al medio de pago que se indique, de lo contrario Flow le presentará una página para seleccionarlo. El medio de pago debe haber sido previamente contratado. Podrá ver los identificadores de sus medios de pago en la sección "Medios de pago" ingresando a Flow con sus credenciales. Para indicar todos los medios de pago utilice el identificador:

- 9 Todos los medios

urlConfirmationrequired

string <uri> 

 url callback del comercio donde Flow confirmará el pago

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">url callback del comercio donde Flow confirmará el pago

urlReturnrequired

string <uri> 

 url de retorno del comercio donde Flow redirigirá al pagador

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">url de retorno del comercio donde Flow redirigirá al pagador

optionalstring

 Datos opcionales en formato JSON clave = valor, ejemplo:
  {&quot;rut&quot;:&quot;9999999-9&quot;,&quot;nombre&quot;:&quot;cliente 1&quot;}

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Datos opcionales en formato JSON clave = valor, ejemplo:
  {"rut":"9999999-9","nombre":"cliente 1"}

timeoutinteger

 tiempo en segundos para que una orden expire después de haber sido creada. Si no se envía este parámetro la orden no expirará y estará vigente para pago por tiempo indefinido. Si envía un valor en segundos, la orden expirará x segundos después de haber sido creada y no podrá pagarse.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">tiempo en segundos para que una orden expire después de haber sido creada. Si no se envía este parámetro la orden no expirará y estará vigente para pago por tiempo indefinido. Si envía un valor en segundos, la orden expirará x segundos después de haber sido creada y no podrá pagarse.

merchantIdstring

 Id de comercio asociado. Solo aplica si usted es comercio integrador.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Id de comercio asociado. Solo aplica si usted es comercio integrador.

payment_currencystring

 Moneda en que se espera se pague la orden

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Moneda en que se espera se pague la orden

srequired

string

 la firma de los parámetros efectuada con su secretKey

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">la firma de los parámetros efectuada con su secretKey

Copy

{
- "apiKey": "string",

- "commerceOrder": "string",

- "subject": "string",

- "currency": "string",

- "amount": 0,

- "email": "user@example.com",

- "paymentMethod": 0,

- "urlConfirmation": "http://example.com",

- "urlReturn": "http://example.com",

- "optional": "string",

- "timeout": 0,

- "merchantId": "string",

- "payment_currency": "string",

- "s": "string"

}

### Firma de parámetros​
Ejemplos de firmado de parámetros en diferentes lenguajes de programación
- PHP
- NodeJS
- Phyton$secretKey = 'my secret'$params = array('apiKey' => '1F90971E-8276-4715-97FF-2BLG5030EE3B','token' => 'AJ089FF5467367');$keys = array_keys($params);sort($keys);$toSign = '';foreach($keys as $key) {$toSign .= $key . $params[$key];};$signature = hash_hmac('sha256', $toSign , $secretKey);

const {createHmac} = require("node:crypto")const secretKey = "my secret";const params = {  apiKey: "1F90971E-8276-4715-97FF-2BLG5030EE3B",  token: "AJ089FF5467367",};const keys = Object.keys(params);keys.sort();let toSign = "";for (let i = 0; i < keys.length; i++) {  let key = keys[i];  toSign += key + params[key];}const signature = createHmac("sha256",secretKey).update(toSign).digest("hex")

import hmacimport hashlibsecret_keyparams = {'apiKey': '1F90971E-8276-4715-97FF-2BLG5030EE3B','token': 'AJ089FF5467367'}keys = list(params.keys())keys.sort()to_sign = ''for key in keys:    to_sign += key + params[key]    signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()

La respuesta que entrega por Flow al llamado a crear una orden es del tipo JSON donde se indican los parámetros, flowOrder, url y token. Los parámetros url y token permiten construir la dirección del checkout para que el cliente sea redirigido al checkout de Flow.

urlstring

 URL ha redireccionar. Para formar el link de pago a esta URL se debe concatenar el token de la siguiente manera:
  url + &quot;?token=&quot; + token

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">URL ha redireccionar. Para formar el link de pago a esta URL se debe concatenar el token de la siguiente manera:
  url + "?token=" + token

tokenstring

 token de la transacción

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">token de la transacción

flowOrdernumber

 Número de order de cobro Flow

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de order de cobro Flow

Copy

{
- "url": "https://api.flow.cl",

- "token": "33373581FC32576FAF33C46FC6454B1FFEBD7E1H",

- "flowOrder": 8765456

}

### Redirección​
El comercio debe redireccionar al cliente concatenado la url y token de la siguiente forma: url + "?token=" + token.

El cliente, a su vez, podrá seleccionar uno de los medios de pagos disponibles y proceder con la transacción. Los comercios pueden administrar los medios de pagos que tienen disponibles a sus clientes desde el portal de Flow.

---

## Flujo de integración

> Fuente: https://developers.flow.cl/docs/tutorial-basics/integration-flow

- 

- Pago Ecommerce
- Flujo de integración

### Flujo de integración
A continuación, se muestra el proceso de integración con Flow, desde la creación de una orden hasta su finalización.

- Crear orden de pago
Este proceso abarca desde la creación de una orden de pago mediante API hasta la redirección del usuario a la plataforma de Flow, donde podrá seleccionar su método de pago y completar la transacción de forma segura.

- Pago de la orden
El cliente paga en el checkout de Flow, y la confirmación de la transacción se envía al comercio. Este debe responder con un código HTTP 200 en menos de 15 segundos. Además, puede consultar el estado de la orden en cualquier momento mediante la API de Flow.

- Finalización de la orden
Tras la confirmación del pago, Flow redirige al cliente a la URL de retorno definida por el comercio. Este puede consultar el estado de la orden mediante la API y actualizar su sistema. Finalmente, debe mostrar al cliente el resultado de la transacción, indicando si está completada o pendiente en caso de pagos asíncronos.

---

## Confirmación de la orden

> Fuente: https://developers.flow.cl/docs/tutorial-basics/order-confirmation

- 

- Pago Ecommerce
- Confirmación de ordenEn esta página

### Confirmación de la orden

### Pago de la orden​
El checkout de Flow es la interfaz donde el cliente elige el método de pago para realizar el pago de su orden. Según la opción seleccionada, es posible que se produzca una redirección a los servicios propios del proveedor de pago.

### Recepción de la confirmación de la orden​
Una vez realizado el pago, Flow realiza un llamado tipo REST con un método POST a la url callback de confirmación definida en la creación de la orden en el parámetro urlConfirmation.

Dependiendo del método de pago, la confirmación de la orden puede recibirse antes de la redirección indicada en el parámetro urlReturn. En el caso de los métodos de pago asíncronos, principalmente aquellos que implican pago en efectivo, la confirmación llega después de la redirección.

El llamado a la url de retorno se compone principalmente por:

Método: POST

Header: Content-Type application/x-www-form-urlencoded

body: token=token de la transacción

tokenstring

 Token de transacción

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Token de transacción

Copy

{
- "token": 123187565538192

}

Esta confirmación debe ser respondida con un código http de respuesta 200 en menos de 15 segundos. Considerando un rango adecuado de respuesta entre 1 y 10 segundos.

En caso de que la respuesta desde el cliente no sea 200 o supere los 15 segundos, se notifica vía correo con el título “Alerta: Problema de integración - Flow”. Donde se indican los detalles de la transacción, el código de http de respuesta recibido y el tiempo de respuesta del webhook.

Los estados de las transacciones no se verán afectados por errores en la respuesta de la confirmación. Por lo tanto, si una transacción es pagada correctamente y existe un error en la respuesta en la url de confirmación, la transacción se mantendrá exitosa.

### Medios de pago sincronos​

Son aquellos medios de pagos que entregan en línea el resultado de la transacción, por ejemplo: las tarjetas de crédito, débito, prepago y billetera.

### Medios de pago asincronos​

Aquellos que permiten al cliente realizar pagos en una sucursal física. En este último caso, la confirmación de pago de Flow hacia el comercio puede ocurrir varias horas después de que el cliente sea redireccionado a la url de retorno.

---

## Finalización de orden

> Fuente: https://developers.flow.cl/docs/tutorial-basics/order-finished

- 

- Pago Ecommerce
- Finalización de ordenEn esta página

### Finalización de ordenLa etapa de finalización de la orden ocurre luego de unos segundos tras realizar la confirmación para los medios de pagos síncronos. Flow hace un método POST mediante el browser en la url de retorno urlReturn definida por el comercio en la creación de la orden. Este llamado se diferencia con el llamado de confirmación en la cabecera que, en este caso, acepta tipo text/html, application/xhtml+xml y application/xml.

Tip

Al momento de que tu servidor recibe esta petición POST mediante el browser puedes extraer la información que necesites del llamado y redirigir al usuario hasta tu página de confirmación con esta información

A diferencia de la url de confirmación, Flow no notificará al comercio en caso de que la url de retorno responda un código http diferente de 200. No obstante, se recomienda siempre tener disponible el servicio de la url de retorno.

Con el token de transacción enviado en el body, el comercio puede llamar al recurso /payment/getStatus mediante un método GET y así obtener el estado de la transacción. Una vez el comercio recibe el resultado de la consulta del estado, este debería actualizar el estado de la transacción en sus sistemas e informarle al cliente el resultado de la finalización de la orden.

Para lograr una buena experiencia de compra se recomienda verificar el estado de la transacción una vez recibida la confirmación y la redirección entregada por Flow.

### Redirección al cliente​
El comercio debe mostrar al cliente el resultado de la transacción. En el caso de medios de pago asíncronos, donde la redirección puede ocurrir antes de la confirmación, es importante informar al cliente que el estado de la transacción está pendiente hasta que se complete el pago de la orden.

---

## Reversar orden

> Fuente: https://developers.flow.cl/docs/tutorial-basics/order-reverse

- 

- Pago Ecommerce
- Reversar ordenEn esta página

### Reversar ordenEste servicio permite crear una orden de reembolso. Una vez que el receptor del reembolso acepte o rechace el reembolso, Flow notificará vía POST a la página del comercio identificada en urlCallback.

apiKeyrequired

string

 apiKey del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">apiKey del comercio

refundCommerceOrderrequired

string

 La orden de reembolso del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">La orden de reembolso del comercio

receiverEmailrequired

string

 Email del receptor del reembolso

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Email del receptor del reembolso

amountrequired

number

 Monto del reembolso

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Monto del reembolso

urlCallBackrequired

string

 La url callback del comercio donde Flow comunica el estado del reembolso

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">La url callback del comercio donde Flow comunica el estado del reembolso

commerceTrxIdstring

 Identificador del comercio de la transacción original que se va reembolsar

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador del comercio de la transacción original que se va reembolsar

flowTrxIdstring

 Identificador de Flow de la transacción original que se va reembolsar.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Identificador de Flow de la transacción original que se va reembolsar.

srequired

string

 la firma de los parámetros efectuada con su secretKey

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">la firma de los parámetros efectuada con su secretKey

Copy

{
- "apiKey": 735646182987483,

- "refundCommerceOrder": "uuid-1230-3123-1231",

- "receiverEmail": "string",

- "amount": 0,

- "urlCallBack": "string",

- "commerceTrxId": "string",

- "flowTrxId": "string",

- "s": "string"

}

La respuesta de Flow ante este llamado tiene la siguiente estructura.

tokenstring

 Token del reembolso

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Token del reembolso

flowRefundOrderstring

 Número de orden de reembolso

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Número de orden de reembolso

datestring <yyyy-mm-dd hh:mm.ss> 

 Fecha de solicitud de reembolso

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Fecha de solicitud de reembolso

statusstring

 Estado del reembolso, los estado pueden ser:

- created Solicitud creada

- accepted Reembolso aceptado

- rejected Reembolso rechazado

- refunded Reembolso reembolsado

- canceled Reembolso cancelado

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Estado del reembolso, los estado pueden ser:

- created Solicitud creada

- accepted Reembolso aceptado

- rejected Reembolso rechazado

- refunded Reembolso reembolsado

- canceled Reembolso cancelado

amountnumber

 Monto del reembolso

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Monto del reembolso

feenumber

 Costo del servicio de reembolso

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Costo del servicio de reembolso

Copy

{
- "token": "C93B4FAD6D63ED9A3F25D21E5D6DD0105FA8CAAQ",

- "flowRefundOrder": "122767",

- "date": "2017-07-21 12:33:15",

- "status": "created",

- "amount": "12000.00",

- "fee": "240.00"

}

### Tipos de reembolso​
Los métodos de devolución del pago varían según el estado en que se encuentre la transacción. Estos pueden ser:

- Anulación

- Reversa de cobro

- Transferencia bancaria

---

## Estado de una orden

> Fuente: https://developers.flow.cl/docs/tutorial-basics/status

- 

- Pago Ecommerce
- Estado de ordenEn esta página

### Estado de una orden
Consulta el estado de tus órdenes.

Para verificar el estado de la transacción se debe llamar al recurso de Flow /payment/getStatus mediante un método GET. Los parámetros requeridos para realizar la consulta del estado de la transacción se describen en la siguiente tabla. Estos parámetros se deben incluir como query parameters en la consulta.

### Parámetros consulta​
Los parámetros requeridos para realizar la consulta del estado de la transacción se describen en la siguiente tabla. Estos parámetros se deben incluir como query parameters en la consulta.

apiKeyrequired

string

 apiKey del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">apiKey del comercio

tokenrequired

string

 token de la transacción enviado por Flow

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">token de la transacción enviado por Flow

srequired

string

 la firma de los parámetros efectuada con su secretKey

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">la firma de los parámetros efectuada con su secretKey

Copy

{
- "apiKey": "1F90971E-8276-4715-97FF-2BLG5030EE3B",

- "token": "AJ089FF5467367",

- "s": "33373581FC32576FAF33C46FC6454B1FFEBD7E1H"

}

### Firma de parámetros​
Ejemplos de firmado de parámetros en diferentes lenguajes de programación
- PHP
- NodeJS
- Phyton$secretKey = 'my secret'$params = array('apiKey' => '1F90971E-8276-4715-97FF-2BLG5030EE3B','token' => 'AJ089FF5467367');$keys = array_keys($params);sort($keys);$toSign = '';foreach($keys as $key) {$toSign .= $key . $params[$key];};$signature = hash_hmac('sha256', $toSign , $secretKey);

const {createHmac} = require("node:crypto")const secretKey = "my secret";const params = {  apiKey: "1F90971E-8276-4715-97FF-2BLG5030EE3B",  token: "AJ089FF5467367",};const keys = Object.keys(params);keys.sort();let toSign = "";for (let i = 0; i < keys.length; i++) {  let key = keys[i];  toSign += key + params[key];}const signature = createHmac("sha256",secretKey).update(toSign).digest("hex")

import hmacimport hashlibsecret_keyparams = {'apiKey': '1F90971E-8276-4715-97FF-2BLG5030EE3B','token': 'AJ089FF5467367'}keys = list(params.keys())keys.sort()to_sign = ''for key in keys:    to_sign += key + params[key]    signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()

### Parámetros respuesta​
La respuesta de la consulta del estado de la transacción es del tipo JSON y los parámetros de ella se detallan a continuación.

flowOrderinteger

 El número de la orden de Flow

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El número de la orden de Flow

commerceOrderstring

 El número de la orden del comercio

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El número de la orden del comercio

requestDatestring <yyyy-mm-dd hh:mm:ss> 

 La fecha de creación de la orden

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">La fecha de creación de la orden

statusinteger

 El estado de la order 

- 1 pendiente de pago

- 2 pagada

- 3 rechazada

- 4 anulada

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El estado de la order 

- 1 pendiente de pago

- 2 pagada

- 3 rechazada

- 4 anulada

subjectstring

 El concepto de la orden

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El concepto de la orden

currencystring

 La moneda

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">La moneda

amountnumber <float> 

 El monto de la orden

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El monto de la orden

payerstring

 El email del pagador

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">El email del pagador

optionalstring or null

 datos opcionales enviados por el comercio en el request de creación de pago en el parámetro optional en formato JSon

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">datos opcionales enviados por el comercio en el request de creación de pago en el parámetro optional en formato JSon

pending_info

object

 Información para un pago pendiente cuando se generó un cupón de pago. Si no existen datos es que no se generó un cupón de pago.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Información para un pago pendiente cuando se generó un cupón de pago. Si no existen datos es que no se generó un cupón de pago.

paymentData

object

 Los datos del pago

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Los datos del pago

merchantIdstring or null

 Id de comercio asociado. Solo aplica si usted es comercio integrador.

" class="sc-iKOmoZ sc-cCzLxZ cpUhEB dbztbd">Id de comercio asociado. Solo aplica si usted es comercio integrador.

Copy

 Expand all  Collapse all 

{
- "flowOrder": 3567899,

- "commerceOrder": "sf12377",

- "requestDate": "2017-07-21 12:32:11",

- "status": 1,

- "subject": "game console",

- "currency": "CLP",

- "amount": 12000,

- "payer": "pperez@gamil.com",

- "optional": {
- "RUT": "7025521-9",

- "ID": "899564778"

},

- "pending_info": {
- "media": "Multicaja",

- "date": "2017-07-21 10:30:12"

},

- "paymentData": {
- "date": "2017-07-21 12:32:11",

- "media": "webpay",

- "conversionDate": "2017-07-21",

- "conversionRate": 1.1,

- "amount": 12000,

- "currency": "CLP",

- "fee": 551,

- "balance": 11499,

- "transferDate": "2017-07-24"

},

- "merchantId": "string"

}

Una vez recibida la respuesta de la consulta de la orden, el comercio podrá actualizar su estado en sus sistemas. De este modo, al ser redirigido, el cliente verá la vista correspondiente a la transacción, ya sea exitosa, fallida o pendiente de pago.

La consulta del estado se puede realizar en cualquier momento de la transacción, aunque se recomienda hacerlo después de recibir la confirmación de la transacción y al momento de recibir la redirección a la URL de retorno, para informar correctamente al cliente sobre el estado final de la transacción.

Una vez confirmada la transacción con un pago exitoso, Flow notificará por correo electrónico tanto al comercio como al cliente, indicando los detalles de la transacción.

Flow tiene disponible otros servicios para conocer el estado de la orden usando la API:

- /payment/getStatusByCommerceId: Este método permite obtener el estado de un pago en base al commerceId.

- /payment/getStatusByFlowOrder: Este método permite obtener el estado de un pago en base al flowOrder.

- /payment/getPayments: Este método permite obtener la lista paginada de pagos recibidos en un día. Los objetos pagos de la lista tienen la misma estructura de los retornados en los servicios payment/getStatus.

- /payment/getStatusExtended: Este método se utiliza para obtener el estado de un pago. A diferencia del /payment/getStatus este servicio retorna el tipo de pago, los 4 últimos dígitos de la tarjeta, el campo cardNumber con el BIN y últimos 4 dígitos, y la información del último intento de pago. Se debe utilizar en la página callback del comercio para recibir notificaciones de pagos. Cada vez que el pagador efectúe un pago, Flow enviará vía POST una llamada a la página del comercio, pasando como parámetro un token que deberá utilizarse en este servicio.

- /payment/getStatusByFlowOrderExtended: Este método permite obtener el estado de un pago en base al flowOrder. A diferencia del /payment/getStatusByFlowOrder este servicio retorna el tipo de pago, los 4 últimos dígitos de la tarjeta (si el pago se hizo con tarjeta) y la información del último intento de pago.

- /payment/getTransactions: Este método permite obtener la lista paginada de transacciones realizadas en un día. Los objetos transacción de la lista tienen la misma estructura de los retornados en los servicios payment/getStatus.


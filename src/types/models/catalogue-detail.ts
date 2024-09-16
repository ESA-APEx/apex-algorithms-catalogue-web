export interface CatalogueDetail {
  description: string
  id: string
  links: Link[]
  parameters: Parameter[]
  process_graph: ProcessGraph
  public: boolean
  summary: string
}

export interface Link {
  href: string
  rel: string
  title: string
}

export interface Parameter {
  description: string
  name: string
  schema: Schema
}

export interface Schema {
  properties?: Properties
  required?: string[]
  subtype: string
  type: string
  items?: Items
  maxItems?: number
  minItems?: number
  uniqueItems?: boolean
}

export interface Properties {
  crs: Crs
  east: East
  north: North
  south: South
  west: West
}

export interface Crs {
  anyOf: AnyOf[]
  default: number
  description: string
}

export interface AnyOf {
  minimum?: number
  subtype: string
  title: string
  type: string
}

export interface East {
  description: string
  type: string
}

export interface North {
  description: string
  type: string
}

export interface South {
  description: string
  type: string
}

export interface West {
  description: string
  type: string
}

export interface Items {
  anyOf: AnyOf2[]
}

export interface AnyOf2 {
  format?: string
  subtype?: string
  type: string
}

export interface ProcessGraph {
  aggregatetemporalperiod1: Aggregatetemporalperiod1
  aggregatetemporalperiod2: Aggregatetemporalperiod2
  apply1: Apply1
  apply2: Apply2
  apply3: Apply3
  apply4: Apply4
  apply5: Apply5
  apply6: Apply6
  apply7: Apply7
  applydimension1: Applydimension1
  applyneighborhood1: Applyneighborhood1
  applyneighborhood2: Applyneighborhood2
  applyneighborhood3: Applyneighborhood3
  applyneighborhood4: Applyneighborhood4
  filterbands1: Filterbands1
  filterbbox1: Filterbbox1
  loadcollection1: Loadcollection1
  loadcollection2: Loadcollection2
  loadcollection3: Loadcollection3
  loadcollection4: Loadcollection4
  loadstac1: Loadstac1
  mask1: Mask1
  mask2: Mask2
  mergecubes1: Mergecubes1
  mergecubes2: Mergecubes2
  mergecubes3: Mergecubes3
  reducedimension1: Reducedimension1
  reducedimension2: Reducedimension2
  renamelabels1: Renamelabels1
  renamelabels2: Renamelabels2
  renamelabels3: Renamelabels3
  renamelabels4: Renamelabels4
  renamelabels5: Renamelabels5
  renamelabels6: Renamelabels6
  renamelabels7: Renamelabels7
  renamelabels8: Renamelabels8
  renamelabels9: Renamelabels9
  resamplespatial1: Resamplespatial1
  resamplespatial2: Resamplespatial2
  sarbackscatter1: Sarbackscatter1
  toscldilationmask1: Toscldilationmask1
}

export interface Aggregatetemporalperiod1 {
  arguments: Arguments
  process_id: string
}

export interface Arguments {
  data: Data
  dimension: string
  period: string
  reducer: Reducer
}

export interface Data {
  from_node: string
}

export interface Reducer {
  process_graph: ProcessGraph2
}

export interface ProcessGraph2 {
  median1: Median1
}

export interface Median1 {
  arguments: Arguments2
  process_id: string
  result: boolean
}

export interface Arguments2 {
  data: Data2
}

export interface Data2 {
  from_parameter: string
}

export interface Aggregatetemporalperiod2 {
  arguments: Arguments3
  process_id: string
}

export interface Arguments3 {
  data: Data3
  dimension: string
  period: string
  reducer: Reducer2
}

export interface Data3 {
  from_node: string
}

export interface Reducer2 {
  process_graph: ProcessGraph3
}

export interface ProcessGraph3 {
  mean1: Mean1
}

export interface Mean1 {
  arguments: Arguments4
  process_id: string
  result: boolean
}

export interface Arguments4 {
  data: Data4
}

export interface Data4 {
  from_parameter: string
}

export interface Apply1 {
  arguments: Arguments5
  process_id: string
}

export interface Arguments5 {
  data: Data5
  process: Process
}

export interface Data5 {
  from_node: string
}

export interface Process {
  process_graph: ProcessGraph4
}

export interface ProcessGraph4 {
  linearscalerange1: Linearscalerange1
}

export interface Linearscalerange1 {
  arguments: Arguments6
  process_id: string
  result: boolean
}

export interface Arguments6 {
  inputMax: number
  inputMin: number
  outputMax: number
  outputMin: number
  x: X
}

export interface X {
  from_parameter: string
}

export interface Apply2 {
  arguments: Arguments7
  process_id: string
}

export interface Arguments7 {
  data: Data6
  process: Process2
}

export interface Data6 {
  from_node: string
}

export interface Process2 {
  process_graph: ProcessGraph5
}

export interface ProcessGraph5 {
  linearscalerange2: Linearscalerange2
}

export interface Linearscalerange2 {
  arguments: Arguments8
  process_id: string
  result: boolean
}

export interface Arguments8 {
  inputMax: number
  inputMin: number
  outputMax: number
  outputMin: number
  x: X2
}

export interface X2 {
  from_parameter: string
}

export interface Apply3 {
  arguments: Arguments9
  process_id: string
}

export interface Arguments9 {
  data: Data7
  process: Process3
}

export interface Data7 {
  from_node: string
}

export interface Process3 {
  process_graph: ProcessGraph6
}

export interface ProcessGraph6 {
  linearscalerange3: Linearscalerange3
}

export interface Linearscalerange3 {
  arguments: Arguments10
  process_id: string
  result: boolean
}

export interface Arguments10 {
  inputMax: number
  inputMin: number
  outputMax: number
  outputMin: number
  x: X3
}

export interface X3 {
  from_parameter: string
}

export interface Apply4 {
  arguments: Arguments11
  process_id: string
}

export interface Arguments11 {
  data: Data8
  process: Process4
}

export interface Data8 {
  from_node: string
}

export interface Process4 {
  process_graph: ProcessGraph7
}

export interface ProcessGraph7 {
  linearscalerange4: Linearscalerange4
}

export interface Linearscalerange4 {
  arguments: Arguments12
  process_id: string
  result: boolean
}

export interface Arguments12 {
  inputMax: number
  inputMin: number
  outputMax: number
  outputMin: number
  x: X4
}

export interface X4 {
  from_parameter: string
}

export interface Apply5 {
  arguments: Arguments13
  process_id: string
}

export interface Arguments13 {
  data: Data9
  process: Process5
}

export interface Data9 {
  from_node: string
}

export interface Process5 {
  process_graph: ProcessGraph8
}

export interface ProcessGraph8 {
  linearscalerange5: Linearscalerange5
}

export interface Linearscalerange5 {
  arguments: Arguments14
  process_id: string
  result: boolean
}

export interface Arguments14 {
  inputMax: number
  inputMin: number
  outputMax: number
  outputMin: number
  x: X5
}

export interface X5 {
  from_parameter: string
}

export interface Apply6 {
  arguments: Arguments15
  process_id: string
}

export interface Arguments15 {
  data: Data10
  process: Process6
}

export interface Data10 {
  from_node: string
}

export interface Process6 {
  process_graph: ProcessGraph9
}

export interface ProcessGraph9 {
  eq1: Eq1
}

export interface Eq1 {
  arguments: Arguments16
  process_id: string
  result: boolean
}

export interface Arguments16 {
  x: X6
  y: number
}

export interface X6 {
  from_parameter: string
}

export interface Apply7 {
  arguments: Arguments17
  process_id: string
  result: boolean
}

export interface Arguments17 {
  data: Data11
  process: Process7
}

export interface Data11 {
  from_node: string
}

export interface Process7 {
  process_graph: ProcessGraph10
}

export interface ProcessGraph10 {
  linearscalerange6: Linearscalerange6
}

export interface Linearscalerange6 {
  arguments: Arguments18
  process_id: string
  result: boolean
}

export interface Arguments18 {
  inputMax: number
  inputMin: number
  outputMax: number
  outputMin: number
  x: X7
}

export interface X7 {
  from_parameter: string
}

export interface Applydimension1 {
  arguments: Arguments19
  process_id: string
}

export interface Arguments19 {
  data: Data12
  dimension: string
  process: Process8
}

export interface Data12 {
  from_node: string
}

export interface Process8 {
  process_graph: ProcessGraph11
}

export interface ProcessGraph11 {
  add1: Add1
  add2: Add2
  arraycreate1: Arraycreate1
  arrayelement1: Arrayelement1
  arrayelement2: Arrayelement2
  arrayelement3: Arrayelement3
  arrayelement4: Arrayelement4
  divide1: Divide1
  divide2: Divide2
  if1: If1
  if2: If2
  isnodata1: Isnodata1
  isnodata2: Isnodata2
  log1: Log1
  log2: Log2
  multiply1: Multiply1
  multiply2: Multiply2
  power1: Power1
  power2: Power2
}

export interface Add1 {
  arguments: Arguments20
  process_id: string
}

export interface Arguments20 {
  x: X8
  y: number
}

export interface X8 {
  from_node: string
}

export interface Add2 {
  arguments: Arguments21
  process_id: string
}

export interface Arguments21 {
  x: X9
  y: number
}

export interface X9 {
  from_node: string
}

export interface Arraycreate1 {
  arguments: Arguments22
  process_id: string
  result: boolean
}

export interface Arguments22 {
  data: Daum[]
}

export interface Daum {
  from_node: string
}

export interface Arrayelement1 {
  arguments: Arguments23
  process_id: string
}

export interface Arguments23 {
  data: Data13
  index: number
}

export interface Data13 {
  from_parameter: string
}

export interface Arrayelement2 {
  arguments: Arguments24
  process_id: string
}

export interface Arguments24 {
  data: Data14
  index: number
}

export interface Data14 {
  from_parameter: string
}

export interface Arrayelement3 {
  arguments: Arguments25
  process_id: string
}

export interface Arguments25 {
  data: Data15
  index: number
}

export interface Data15 {
  from_parameter: string
}

export interface Arrayelement4 {
  arguments: Arguments26
  process_id: string
}

export interface Arguments26 {
  data: Data16
  index: number
}

export interface Data16 {
  from_parameter: string
}

export interface Divide1 {
  arguments: Arguments27
  process_id: string
}

export interface Arguments27 {
  x: X10
  y: number
}

export interface X10 {
  from_node: string
}

export interface Divide2 {
  arguments: Arguments28
  process_id: string
}

export interface Arguments28 {
  x: X11
  y: number
}

export interface X11 {
  from_node: string
}

export interface If1 {
  arguments: Arguments29
  process_id: string
}

export interface Arguments29 {
  accept: number
  reject: Reject
  value: Value
}

export interface Reject {
  from_node: string
}

export interface Value {
  from_node: string
}

export interface If2 {
  arguments: Arguments30
  process_id: string
}

export interface Arguments30 {
  accept: number
  reject: Reject2
  value: Value2
}

export interface Reject2 {
  from_node: string
}

export interface Value2 {
  from_node: string
}

export interface Isnodata1 {
  arguments: Arguments31
  process_id: string
}

export interface Arguments31 {
  x: X12
}

export interface X12 {
  from_node: string
}

export interface Isnodata2 {
  arguments: Arguments32
  process_id: string
}

export interface Arguments32 {
  x: X13
}

export interface X13 {
  from_node: string
}

export interface Log1 {
  arguments: Arguments33
  process_id: string
}

export interface Arguments33 {
  base: number
  x: X14
}

export interface X14 {
  from_node: string
}

export interface Log2 {
  arguments: Arguments34
  process_id: string
}

export interface Arguments34 {
  base: number
  x: X15
}

export interface X15 {
  from_node: string
}

export interface Multiply1 {
  arguments: Arguments35
  process_id: string
}

export interface Arguments35 {
  x: number
  y: Y
}

export interface Y {
  from_node: string
}

export interface Multiply2 {
  arguments: Arguments36
  process_id: string
}

export interface Arguments36 {
  x: number
  y: Y2
}

export interface Y2 {
  from_node: string
}

export interface Power1 {
  arguments: Arguments37
  process_id: string
}

export interface Arguments37 {
  base: number
  p: P
}

export interface P {
  from_node: string
}

export interface Power2 {
  arguments: Arguments38
  process_id: string
}

export interface Arguments38 {
  base: number
  p: P2
}

export interface P2 {
  from_node: string
}

export interface Applyneighborhood1 {
  arguments: Arguments39
  process_id: string
}

export interface Arguments39 {
  data: Data17
  overlap: Overlap[]
  process: Process9
  size: Size[]
}

export interface Data17 {
  from_node: string
}

export interface Overlap {
  dimension: string
  unit: string
  value: number
}

export interface Process9 {
  process_graph: ProcessGraph12
}

export interface ProcessGraph12 {
  runudf1: Runudf1
}

export interface Runudf1 {
  arguments: Arguments40
  process_id: string
  result: boolean
}

export interface Arguments40 {
  context: Context
  data: Data18
  runtime: string
  udf: string
}

export interface Context {
  presto_model_url: string
  rescale_s1: boolean
}

export interface Data18 {
  from_parameter: string
}

export interface Size {
  dimension: string
  unit: string
  value: number
}

export interface Applyneighborhood2 {
  arguments: Arguments41
  process_id: string
}

export interface Arguments41 {
  data: Data19
  overlap: Overlap2[]
  process: Process10
  size: Size2[]
}

export interface Data19 {
  from_node: string
}

export interface Overlap2 {
  dimension: string
  unit: string
  value: number
}

export interface Process10 {
  process_graph: ProcessGraph13
}

export interface ProcessGraph13 {
  runudf2: Runudf2
}

export interface Runudf2 {
  arguments: Arguments42
  process_id: string
  result: boolean
}

export interface Arguments42 {
  context: Context2
  data: Data20
  runtime: string
  udf: string
}

export interface Context2 {
  classifier_url: string
}

export interface Data20 {
  from_parameter: string
}

export interface Size2 {
  dimension: string
  unit?: string
  value: any
}

export interface Applyneighborhood3 {
  arguments: Arguments43
  process_id: string
}

export interface Arguments43 {
  data: Data21
  overlap: Overlap3[]
  process: Process11
  size: Size3[]
}

export interface Data21 {
  from_node: string
}

export interface Overlap3 {
  dimension: string
  unit: string
  value: number
}

export interface Process11 {
  process_graph: ProcessGraph14
}

export interface ProcessGraph14 {
  runudf3: Runudf3
}

export interface Runudf3 {
  arguments: Arguments44
  process_id: string
  result: boolean
}

export interface Arguments44 {
  context: Context3
  data: Data22
  runtime: string
  udf: string
}

export interface Context3 {
  presto_model_url: string
  rescale_s1: boolean
}

export interface Data22 {
  from_parameter: string
}

export interface Size3 {
  dimension: string
  unit: string
  value: number
}

export interface Applyneighborhood4 {
  arguments: Arguments45
  process_id: string
}

export interface Arguments45 {
  data: Data23
  overlap: Overlap4[]
  process: Process12
  size: Size4[]
}

export interface Data23 {
  from_node: string
}

export interface Overlap4 {
  dimension: string
  unit: string
  value: number
}

export interface Process12 {
  process_graph: ProcessGraph15
}

export interface ProcessGraph15 {
  runudf4: Runudf4
}

export interface Runudf4 {
  arguments: Arguments46
  process_id: string
  result: boolean
}

export interface Arguments46 {
  context: Context4
  data: Data24
  runtime: string
  udf: string
}

export interface Context4 {
  classifier_url: string
}

export interface Data24 {
  from_parameter: string
}

export interface Size4 {
  dimension: string
  unit?: string
  value: any
}

export interface Filterbands1 {
  arguments: Arguments47
  process_id: string
}

export interface Arguments47 {
  bands: string[]
  data: Data25
}

export interface Data25 {
  from_node: string
}

export interface Filterbbox1 {
  arguments: Arguments48
  process_id: string
}

export interface Arguments48 {
  data: Data26
  extent: Extent
}

export interface Data26 {
  from_node: string
}

export interface Extent {
  from_parameter: string
}

export interface Loadcollection1 {
  arguments: Arguments49
  process_id: string
}

export interface Arguments49 {
  bands: string[]
  featureflags: Featureflags
  id: string
  properties: Properties2
  spatial_extent: SpatialExtent
  temporal_extent: TemporalExtent
}

export interface Featureflags {
  tilesize: number
}

export interface Properties2 {
  "eo:cloud_cover": EoCloudCover
}

export interface EoCloudCover {
  process_graph: ProcessGraph16
}

export interface ProcessGraph16 {
  lte1: Lte1
}

export interface Lte1 {
  arguments: Arguments50
  process_id: string
  result: boolean
}

export interface Arguments50 {
  x: X16
  y: number
}

export interface X16 {
  from_parameter: string
}

export interface SpatialExtent {
  from_parameter: string
}

export interface TemporalExtent {
  from_parameter: string
}

export interface Loadcollection2 {
  arguments: Arguments51
  process_id: string
}

export interface Arguments51 {
  bands: string[]
  id: string
  properties: Properties3
  spatial_extent: SpatialExtent2
  temporal_extent: TemporalExtent2
}

export interface Properties3 {
  "eo:cloud_cover": EoCloudCover2
}

export interface EoCloudCover2 {
  process_graph: ProcessGraph17
}

export interface ProcessGraph17 {
  lte2: Lte2
}

export interface Lte2 {
  arguments: Arguments52
  process_id: string
  result: boolean
}

export interface Arguments52 {
  x: X17
  y: number
}

export interface X17 {
  from_parameter: string
}

export interface SpatialExtent2 {
  from_parameter: string
}

export interface TemporalExtent2 {
  from_parameter: string
}

export interface Loadcollection3 {
  arguments: Arguments53
  process_id: string
}

export interface Arguments53 {
  bands: string[]
  id: string
  spatial_extent: SpatialExtent3
  temporal_extent: TemporalExtent3
}

export interface SpatialExtent3 {
  from_parameter: string
}

export interface TemporalExtent3 {
  from_parameter: string
}

export interface Loadcollection4 {
  arguments: Arguments54
  process_id: string
}

export interface Arguments54 {
  bands: string[]
  id: string
  spatial_extent: SpatialExtent4
  temporal_extent: any
}

export interface SpatialExtent4 {
  from_parameter: string
}

export interface Loadstac1 {
  arguments: Arguments55
  process_id: string
}

export interface Arguments55 {
  bands: string[]
  featureflags: Featureflags2
  spatial_extent: SpatialExtent5
  temporal_extent: TemporalExtent4
  url: string
}

export interface Featureflags2 {
  tilesize: number
}

export interface SpatialExtent5 {
  from_parameter: string
}

export interface TemporalExtent4 {
  from_parameter: string
}

export interface Mask1 {
  arguments: Arguments56
  process_id: string
}

export interface Arguments56 {
  data: Data27
  mask: Mask
}

export interface Data27 {
  from_node: string
}

export interface Mask {
  from_node: string
}

export interface Mask2 {
  arguments: Arguments57
  process_id: string
}

export interface Arguments57 {
  data: Data28
  mask: Mask3
  replacement: number
}

export interface Data28 {
  from_node: string
}

export interface Mask3 {
  from_node: string
}

export interface Mergecubes1 {
  arguments: Arguments58
  process_id: string
}

export interface Arguments58 {
  cube1: Cube1
  cube2: Cube2
}

export interface Cube1 {
  from_node: string
}

export interface Cube2 {
  from_node: string
}

export interface Mergecubes2 {
  arguments: Arguments59
  process_id: string
}

export interface Arguments59 {
  cube1: Cube12
  cube2: Cube22
}

export interface Cube12 {
  from_node: string
}

export interface Cube22 {
  from_node: string
}

export interface Mergecubes3 {
  arguments: Arguments60
  process_id: string
}

export interface Arguments60 {
  cube1: Cube13
  cube2: Cube23
}

export interface Cube13 {
  from_node: string
}

export interface Cube23 {
  from_node: string
}

export interface Reducedimension1 {
  arguments: Arguments61
  process_id: string
}

export interface Arguments61 {
  data: Data29
  dimension: string
  reducer: Reducer3
}

export interface Data29 {
  from_node: string
}

export interface Reducer3 {
  process_graph: ProcessGraph18
}

export interface ProcessGraph18 {
  min1: Min1
}

export interface Min1 {
  arguments: Arguments62
  process_id: string
  result: boolean
}

export interface Arguments62 {
  data: Data30
}

export interface Data30 {
  from_parameter: string
}

export interface Reducedimension2 {
  arguments: Arguments63
  process_id: string
}

export interface Arguments63 {
  data: Data31
  dimension: string
  reducer: Reducer4
}

export interface Data31 {
  from_node: string
}

export interface Reducer4 {
  process_graph: ProcessGraph19
}

export interface ProcessGraph19 {
  mean2: Mean2
}

export interface Mean2 {
  arguments: Arguments64
  process_id: string
  result: boolean
}

export interface Arguments64 {
  data: Data32
}

export interface Data32 {
  from_parameter: string
}

export interface Renamelabels1 {
  arguments: Arguments65
  process_id: string
}

export interface Arguments65 {
  data: Data33
  dimension: string
  target: string[]
}

export interface Data33 {
  from_node: string
}

export interface Renamelabels2 {
  arguments: Arguments66
  process_id: string
}

export interface Arguments66 {
  data: Data34
  dimension: string
  source: string[]
  target: string[]
}

export interface Data34 {
  from_node: string
}

export interface Renamelabels3 {
  arguments: Arguments67
  process_id: string
}

export interface Arguments67 {
  data: Data35
  dimension: string
  source: string[]
  target: string[]
}

export interface Data35 {
  from_node: string
}

export interface Renamelabels4 {
  arguments: Arguments68
  process_id: string
}

export interface Arguments68 {
  data: Data36
  dimension: string
  source: string[]
  target: string[]
}

export interface Data36 {
  from_node: string
}

export interface Renamelabels5 {
  arguments: Arguments69
  process_id: string
}

export interface Arguments69 {
  data: Data37
  dimension: string
  target: string[]
}

export interface Data37 {
  from_node: string
}

export interface Renamelabels6 {
  arguments: Arguments70
  process_id: string
}

export interface Arguments70 {
  data: Data38
  dimension: string
  target: string[]
}

export interface Data38 {
  from_node: string
}

export interface Renamelabels7 {
  arguments: Arguments71
  process_id: string
}

export interface Arguments71 {
  data: Data39
  dimension: string
  target: string[]
}

export interface Data39 {
  from_node: string
}

export interface Renamelabels8 {
  arguments: Arguments72
  process_id: string
}

export interface Arguments72 {
  data: Data40
  dimension: string
  target: string[]
}

export interface Data40 {
  from_node: string
}

export interface Renamelabels9 {
  arguments: Arguments73
  process_id: string
}

export interface Arguments73 {
  data: Data41
  dimension: string
  target: string[]
}

export interface Data41 {
  from_node: string
}

export interface Resamplespatial1 {
  arguments: Arguments74
  process_id: string
}

export interface Arguments74 {
  align: string
  data: Data42
  method: string
  projection: any
  resolution: number
}

export interface Data42 {
  from_node: string
}

export interface Resamplespatial2 {
  arguments: Arguments75
  process_id: string
}

export interface Arguments75 {
  align: string
  data: Data43
  method: string
  projection: any
  resolution: number
}

export interface Data43 {
  from_node: string
}

export interface Sarbackscatter1 {
  arguments: Arguments76
  process_id: string
}

export interface Arguments76 {
  coefficient: string
  contributing_area: boolean
  data: Data44
  elevation_model: string
  ellipsoid_incidence_angle: boolean
  local_incidence_angle: boolean
  mask: boolean
  noise_removal: boolean
}

export interface Data44 {
  from_node: string
}

export interface Toscldilationmask1 {
  arguments: Arguments77
  process_id: string
}

export interface Arguments77 {
  data: Data45
  erosion_kernel_size: number
  kernel1_size: number
  kernel2_size: number
  mask1_values: number[]
  mask2_values: number[]
  scl_band_name: string
}

export interface Data45 {
  from_node: string
}

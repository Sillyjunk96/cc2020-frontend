import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  TextField,
  Typography,
  LinearProgress,
} from '@material-ui/core';
import styled from 'styled-components';
import { NavBar } from './components/NavBar';
import {
  useMatrixGeneratorTrigger,
  useMatrixInput,
  useMatrixListener,
} from './hooks/hook.matrix';
import { useMatrixCalculationTrigger } from './hooks/hook.master';
import SelectionCard from './components/SelectionCard';
import { Calculation, Matrix } from './types/type.matrix';
import SelectionDrawer from './components/SelectionDrawer';
import { useErrorListener } from './hooks/hook.error';

const StyledContainer = styled(Container)`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: space-between;
  & > * {
    flex: 1;
    margin: 25px;
    min-width: 300px;
  }
`;

const App: FC = () => {
  const [openMatrixGen, setOpenMatrixGen] = useState<boolean>(false);
  const [openMatrixSelection, setOpenMatrixSelection] = useState<boolean>(
    false
  );
  const [generated, setGenerated] = useState<number>(0);
  const [firstMatrix, setFirstMatrix] = useState<Matrix | undefined>(
    localStorage.getItem('firstMatrix') !== null
      ? JSON.parse(localStorage.getItem('firstMatrix')!)
      : undefined
  );
  const [secondMatrix, setSecondMatrix] = useState<Matrix | undefined>(
    localStorage.getItem('secondMatrix') !== null
      ? JSON.parse(localStorage.getItem('secondMatrix')!)
      : undefined
  );
  const [currentCalculation, setCurrentCalculation] = useState<
    Calculation | undefined
  >(
    localStorage.getItem('currentCalculation') !== 'undefined'
      ? JSON.parse(localStorage.getItem('currentCalculation')!)
      : undefined
  );

  const { errors } = useErrorListener();

  const {
    availableMatrices,
    resultMatrices,
    calculationCache,
  } = useMatrixListener();
  const onTrigger = useMatrixCalculationTrigger();

  const resetSelection = () => {
    setFirstMatrix(undefined);
    setSecondMatrix(undefined);
    setCurrentCalculation(undefined);
    localStorage.clear();
  };

  const selectMatrix = (matrix: Matrix) => {
    if (firstMatrix && !secondMatrix) {
      setSecondMatrix(matrix);
    } else if (firstMatrix && secondMatrix) {
      setFirstMatrix(matrix);
    } else {
      setFirstMatrix(matrix);
    }
  };

  const startCalculation = () => {
    localStorage.clear();
    onTrigger({
      multiplicand: { id: firstMatrix!.id },
      multiplier: { id: secondMatrix!.id },
    })();
    setCurrentCalculation({
      multiplicand_matrix_id: firstMatrix!.id,
      multiplier_matrix_id: secondMatrix!.id,
      totalCalculations: firstMatrix!.rows * secondMatrix!.columns,
    });
    localStorage.setItem(
      'currentCalculation',
      JSON.stringify(currentCalculation)
    );
    localStorage.setItem('firstMatrix', JSON.stringify(firstMatrix));
    localStorage.setItem('secondMatrix', JSON.stringify(secondMatrix));
  };

  const closeMatrixGen = () => {
    setOpenMatrixGen(false);
  };

  useEffect(() => {
    if (resultMatrices) {
      for (let i = 0; i < resultMatrices.length; i++) {
        if (
          resultMatrices[i].multiplier_matrix_id ===
            currentCalculation?.multiplier_matrix_id &&
          resultMatrices[i].multiplier_matrix_id ===
            currentCalculation?.multiplier_matrix_id
        ) {
          let newCalc = { ...currentCalculation };
          newCalc.result_matrix_id = resultMatrices[i].result_matrix_id;
          setCurrentCalculation(newCalc);
          localStorage.setItem('currentCalculation', JSON.stringify(newCalc));
          return;
        }
      }
    }
  }, [resultMatrices]);

  return (
    <>
      <NavBar
        openDrawer={() => {
          setOpenMatrixSelection(true);
        }}
        openGenModal={() => {
          setOpenMatrixGen(true);
        }}
      />
      <StyledContainer>
        <Box
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <SelectionCard
            firstMatrix={firstMatrix}
            secondMatrix={secondMatrix}
            onReset={resetSelection}
            onTriggerCalc={startCalculation}
            running={!!currentCalculation}
          />
          {currentCalculation && (
            <>
              <Typography variant="h2" style={{ marginTop: '20px' }}>
                Calculation
              </Typography>
              <Box
                style={{
                  marginTop: '20px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box style={{ width: '95%' }}>
                  <LinearProgress
                    variant="determinate"
                    value={
                      currentCalculation?.result_matrix_id
                        ? ((calculationCache.get(
                            currentCalculation?.result_matrix_id
                          )
                            ? Array.from(
                                calculationCache
                                  .get(currentCalculation?.result_matrix_id)!
                                  .keys()
                              ).length
                            : 0) /
                            currentCalculation.totalCalculations) *
                          100
                        : 0
                    }
                  />
                </Box>
                <Typography
                  style={{ minWidth: '100px' }}
                  align="center"
                >{`${(currentCalculation?.result_matrix_id
                  ? ((calculationCache.get(currentCalculation?.result_matrix_id)
                      ? Array.from(
                          calculationCache
                            .get(currentCalculation?.result_matrix_id)!
                            .keys()
                        ).length
                      : 0) /
                      currentCalculation.totalCalculations) *
                    100
                  : 0
                ).toFixed(2)}%`}</Typography>
              </Box>
              <Box
                style={{
                  marginTop: '50px',
                  marginBottom: '20px',
                  maxWidth: '100%',
                  maxHeight: '500px',
                  backgroundColor: '#f0f0f0',
                  overflowY: 'scroll',
                  overflowX: 'scroll',
                  borderRadius: '5px',
                }}
              >
                {[...Array(firstMatrix!.rows)].map((_, i) => (
                  <Box
                    key={`outerMatrixContainer-${i}`}
                    style={{ display: 'flex', flexDirection: 'row' }}
                  >
                    {[...Array(secondMatrix!.columns)].map((_, n) => {
                      return (
                        <Box
                          key={`matrixEntry-${n}`}
                          style={{
                            display: 'inline-block',
                            minHeight: '60px',
                            minWidth: '60px',
                            backgroundColor: '#e5e5e5',
                            borderRadius: '5px',
                            margin: '5px',
                          }}
                        >
                          <Box
                            style={{
                              height: '100%',
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Typography>
                              {currentCalculation?.result_matrix_id &&
                              calculationCache.get(
                                currentCalculation?.result_matrix_id
                              ) &&
                              calculationCache
                                .get(currentCalculation?.result_matrix_id)
                                ?.get(`${i}-${n}`)
                                ? calculationCache
                                    .get(currentCalculation?.result_matrix_id)
                                    ?.get(`${i}-${n}`)
                                : ''}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
              <Errors errors={errors} />
            </>
          )}
        </Box>
      </StyledContainer>
      <MatrixGenModal
        open={openMatrixGen}
        close={closeMatrixGen}
        addLoading={() => {
          setGenerated((curr) => curr + 1);
        }}
      />
      <SelectionDrawer
        matrices={availableMatrices || []}
        loading={generated - availableMatrices.length}
        isOpen={openMatrixSelection}
        onSelect={selectMatrix}
        onClose={() => {
          setOpenMatrixSelection(false);
        }}
      />
    </>
  );
};

const MatrixGenModal = ({
  open,
  close,
  addLoading,
}: {
  open: boolean;
  close: () => void;
  addLoading: () => void;
}) => {
  const { values, onInput, resetInput } = useMatrixInput();
  const onSubmit = useMatrixGeneratorTrigger();

  return (
    <Dialog open={open} onClose={close}>
      <form
        noValidate
        autoComplete="off"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(values)();
        }}
      >
        <DialogContent>
          <Box
            style={{
              minWidth: '500px',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5">generate a new Matrix</Typography>
            <Box
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              <TextField
                id="rows"
                label="rows"
                type="number"
                value={values.rows}
                onChange={onInput('rows')}
              />
              <TextField
                id="columns"
                label="columns"
                type="number"
                value={values.columns}
                onChange={onInput('columns')}
              />
            </Box>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                onSubmit(values)();
                resetInput();
                close();
                addLoading();
              }}
            >
              Generate
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Errors = ({ errors }: { errors?: string[] }) => {
  return (
    <Box style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography>
        {errors && errors.length > 0
          ? 'Errors occurred:'
          : 'No Error occurred sofar!'}
      </Typography>
      {errors &&
        errors.map((error, i) => (
          <Box
            key={`error-${i}`}
            style={{
              width: '100%',
              minHeight: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#ff9999',
              borderRadius: '5px',
              marginBottom: '10px',
            }}
          >
            <Typography>{error}</Typography>
          </Box>
        ))}
    </Box>
  );
};

export default App;

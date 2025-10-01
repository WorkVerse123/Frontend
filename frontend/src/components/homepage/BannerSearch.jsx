import { useState } from 'react';
import { Autocomplete, TextField, Button, InputAdornment, Box } from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PlaceIcon from '@mui/icons-material/Place';

export default function BannerSearch() {
  // store selected option objects (or null)
  const [keyword, setKeyword] = useState(null);
  const [location, setLocation] = useState(null);

  // const jobOptions = [
  //   { value: 'frontend', label: 'Frontend Developer' },
  //   { value: 'backend', label: 'Backend Developer' },
  //   { value: 'fullstack', label: 'Fullstack Developer' },
  //   { value: 'designer', label: 'Designer' },
  //   { value: 'pm', label: 'Product Manager' }
  // ];

  // const locationOptions = [
  //   { value: 'hanoi', label: 'Hà Nội' },
  //   { value: 'hcm', label: 'Hồ Chí Minh' },
  //   { value: 'danang', label: 'Đà Nẵng' },
  //   { value: 'remote', label: 'Remote' }
  // ];

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const data = {
  //     keyword: keyword?.value || null,
  //     location: location?.value || null
  //   };
  //   console.log('Banner search submitted:', data);
  //   // TODO: gửi data lên API hoặc xử lý chuyển trang tìm kiếm
  // };

  return (
    <section className="w-full bg-white pt-8 pb-6 border-b">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 px-4">
        <div className="flex-1 text-left">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-[#042852]">
            Tìm công việc phù hợp<br />với sở thích và <span className="text-[#2563eb]">kỹ năng</span> của bạn.
          </h1>
          <p className="text-gray-600 mb-6">Chào mừng đến với WorkVerse</p>

          {/* <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <Box className="flex-1">
              <Autocomplete
                options={jobOptions}
                getOptionLabel={(opt) => opt.label || ''}
                value={keyword}
                onChange={(_, newVal) => setKeyword(newVal)}
                isOptionEqualToValue={(a, b) => a?.value === b?.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    size="small"
                    label="Chức danh, từ khóa, công ty"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <WorkOutlineIcon className="text-gray-400" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </Box>

            <Box className="flex-1">
              <Autocomplete
                options={locationOptions}
                getOptionLabel={(opt) => opt.label || ''}
                value={location}
                onChange={(_, newVal) => setLocation(newVal)}
                isOptionEqualToValue={(a, b) => a?.value === b?.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    size="small"
                    label="Địa điểm"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <PlaceIcon className="text-gray-400" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, py: 1.5 }}
            >
              Tìm Việc
            </Button>
          </form> */}

        </div>
      </div>
    </section>
  );
}